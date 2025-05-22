import type { Request as ExpressRequest, Response, NextFunction } from "express"
import { Op } from "sequelize"
import sequelize from "../config/database"
import {
  Complaint,
  ComplaintStatus,
  ComplaintPriority,
  Category,
  Subcategory,
  Attachment,
  Comment,
  User,
  UserRole,
} from "../database/models"
import { AppError } from "../utils/appError"
import { uploadToCloudinary } from "../services/fileUploadService"
import { sendNotifications, getNotificationTypeFromStatus } from "../services/notificationService"
// import type { Express } from "express"
import StatusHistory from "../database/models/StatusHistory"
// Extend Express Request to include files property
interface MulterRequest extends ExpressRequest {
  files?: Express.Multer.File[];
  user?: any;
}

// Extend Express Request to include user property for authenticated routes
interface AuthenticatedRequest extends ExpressRequest {
  user: any;
  params: any;
  query: any;
  body: any;
}

// Submit a new complaint
export const submitComplaint = async (req: MulterRequest, res: Response, next: NextFunction) => {
  try {
    const { title, description, location, categoryId, subcategoryId, isAnonymous, fullName, phoneNumber, email } =
      req.body

    // Check if category exists
    const category = await Category.findByPk(categoryId)
    if (!category) {
      return next(new AppError("Category not found", 404))
    }

    // Check if subcategory exists and belongs to the category
    const subcategory = await Subcategory.findOne({
      where: { id: subcategoryId, categoryId },
    })
    if (!subcategory) {
      return next(new AppError("Subcategory not found or does not belong to the selected category", 404))
    }

    // Create the complaint
    const complaintData: any = {
      title,
      description,
      location,
      categoryId,
      subcategoryId,
      isAnonymous: isAnonymous === "true" || isAnonymous === true,
      status: ComplaintStatus.PENDING,
      priority: ComplaintPriority.MEDIUM,
    }

    // If user is authenticated, associate the complaint with the user
    if (req.user && !complaintData.isAnonymous) {
      complaintData.userId = req.user.id
    } else {
      // For anonymous or non-authenticated users, store contact information
      complaintData.fullName = fullName
      complaintData.phoneNumber = phoneNumber
      complaintData.email = email
    }

    const complaint = await Complaint.create(complaintData)

    // Prepare variable to hold attachments for response
    let complaintAttachments: Attachment[] = []

    // Handle file uploads if any
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const attachments: Attachment[] = []

      for (const file of req.files as Express.Multer.File[]) {
        // Upload file to Cloudinary
        const result = await uploadToCloudinary(file)

        // Create attachment record
        const attachment = await Attachment.create({
          complaintId: complaint.id,
          fileName: file.originalname,
          fileType: file.mimetype,
          fileSize: file.size,
          filePath: result.secure_url,
          publicUrl: result.secure_url,
        })

        attachments.push(attachment)
      }

      // Attachments will be included in the response below
      complaintAttachments = attachments
    }

    // Record initial status in history
    await StatusHistory.create({
      complaintId: complaint.id,
      newStatus: ComplaintStatus.PENDING,
      comment: "Complaint submitted",
    })

    // Send notification if contact information is provided
    if (!complaintData.isAnonymous && (complaintData.email || complaintData.phoneNumber)) {
      await sendNotifications(
        {
          email: complaintData.email,
          phoneNumber: complaintData.phoneNumber,
        },
        "submitted",
        {
          trackingId: complaint.trackingId,
          category: category.name,
        },
      )
    }

    res.status(201).json({
      status: "success",
      message: "Complaint submitted successfully",
      data: {
        complaint: {
          id: complaint.id,
          trackingId: complaint.trackingId,
          status: complaint.status,
          createdAt: complaint.createdAt,
          attachments: typeof complaintAttachments !== "undefined" ? complaintAttachments : [],
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

// Get complaint by tracking ID (public)
export const getComplaintByTrackingId = async (req: ExpressRequest, res: Response, next: NextFunction) => {
  try {
    const { trackingId } = req.params

    // Validate tracking ID format
    if (!trackingId || !trackingId.match(/^IJW-\d{4}-\d{5}$/)) {
      return next(
        new AppError("Invalid tracking ID format. Please enter a valid tracking ID (e.g. IJW-2025-12345)", 400),
      )
    }

    const complaint = await Complaint.findOne({
      where: { trackingId },
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name"],
        },
        {
          model: Subcategory,
          as: "subcategory",
          attributes: ["id", "name"],
        },
        {
          model: Attachment,
          as: "attachments",
          attributes: ["id", "fileName", "fileType", "fileSize", "publicUrl", "createdAt"],
        },
        {
          model: Comment,
          as: "comments",
          where: { isInternal: false },
          attributes: ["id", "content", "createdAt"],
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "firstName", "lastName", "role"],
            },
          ],
          required: false,
          order: [["createdAt", "DESC"]],
        },
        {
          model: User,
          as: "assignedUser",
          attributes: ["id", "firstName", "lastName"],
        },
      ],
    })

    if (!complaint) {
      return next(new AppError("No complaint found with this tracking ID. Please check and try again.", 404))
    }

    // Format dates for better readability
    const formatDate = (date: Date) => {
      return date
        ? new Date(date).toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : null
    }

    // Generate status timeline
    const statusTimeline = [
      {
        status: "Submitted",
        date: formatDate(complaint.createdAt),
        completed: true,
        current: complaint.status === ComplaintStatus.PENDING,
      },
      {
        status: "Under Review",
        date: complaint.status !== ComplaintStatus.PENDING ? formatDate(complaint.updatedAt) : null,
        completed: [
          ComplaintStatus.UNDER_REVIEW,
          ComplaintStatus.IN_PROGRESS,
          ComplaintStatus.RESOLVED,
          ComplaintStatus.CLOSED,
        ].includes(complaint.status as ComplaintStatus),
        current: complaint.status === ComplaintStatus.UNDER_REVIEW,
      },
      {
        status: "In Progress",
        date:
          complaint.status === ComplaintStatus.IN_PROGRESS ||
          complaint.status === ComplaintStatus.RESOLVED ||
          complaint.status === ComplaintStatus.CLOSED
            ? formatDate(complaint.updatedAt)
            : null,
        completed: [ComplaintStatus.IN_PROGRESS, ComplaintStatus.RESOLVED, ComplaintStatus.CLOSED].includes(
          complaint.status as ComplaintStatus,
        ),
        current: complaint.status === ComplaintStatus.IN_PROGRESS,
      },
      {
        status: "Resolved",
        date: complaint.resolvedAt ? formatDate(complaint.resolvedAt) : null,
        completed: [ComplaintStatus.RESOLVED, ComplaintStatus.CLOSED].includes(complaint.status as ComplaintStatus),
        current: complaint.status === ComplaintStatus.RESOLVED,
      },
      {
        status: "Closed",
        date: complaint.closedAt ? formatDate(complaint.closedAt) : null,
        completed: complaint.status === ComplaintStatus.CLOSED,
        current: complaint.status === ComplaintStatus.CLOSED,
      },
    ]

    // If rejected, replace the timeline with a rejection notice
    const isRejected = complaint.status === ComplaintStatus.REJECTED

    // Remove sensitive information
    const complaintData = {
      id: complaint.id,
      trackingId: complaint.trackingId,
      title: complaint.title || `${(complaint as any).category?.name} Issue`,
      description: complaint.description,
      location: complaint.location,
      status: complaint.status,
      priority: complaint.priority,
      category: (complaint as any).category,
      subcategory: (complaint as any).subcategory,
      isAnonymous: complaint.isAnonymous,
      submittedAt: formatDate(complaint.createdAt),
      updatedAt: formatDate(complaint.updatedAt),
      resolvedAt: complaint.resolvedAt ? formatDate(complaint.resolvedAt) : null,
      closedAt: complaint.closedAt ? formatDate(complaint.closedAt) : null,
      attachments: (complaint as any).attachments,
      comments: (complaint as any).comments,
      assignedUser: (complaint as any).assignedUser
        ? {
            name: `${(complaint as any).assignedUser.firstName} ${(complaint as any).assignedUser.lastName}`,
          }
        : null,
      statusTimeline: isRejected ? null : statusTimeline,
      isRejected,
      rejectionReason: complaint.rejectionReason,
    };

    res.status(200).json({
      status: "success",
      data: {
        complaint: complaintData,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get user's complaints (authenticated)
export const getUserComplaints = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;

    const complaints = await Complaint.findAll({
      where: { userId },
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name"],
        },
        {
          model: Subcategory,
          as: "subcategory",
          attributes: ["id", "name"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      status: "success",
      results: complaints.length,
      data: {
        complaints,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Add comment to complaint
export const addCommentToComplaint = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { complaintId } = req.params
    const { content, isInternal = false } = req.body
    const userId = req.user.id

    // Check if complaint exists
    const complaint = await Complaint.findByPk(complaintId)
    if (!complaint) {
      return next(new AppError("Complaint not found", 404))
    }

    // Only admins can add internal comments
    if (isInternal && req.user.role !== UserRole.ADMIN) {
      return next(new AppError("You are not authorized to add internal comments", 403))
    }

    // Check if user is authorized to comment on this complaint
    if (req.user.role !== UserRole.ADMIN && complaint.userId !== userId) {
      return next(new AppError("You are not authorized to comment on this complaint", 403))
    }

    const comment = await Comment.create({
      complaintId,
      userId,
      content,
      isInternal,
    })

    // Include user information in response
    const commentWithUser = await Comment.findByPk(comment.id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "firstName", "lastName", "role"],
        },
      ],
    })

    // Send notification if it's an admin comment and not internal
    if (req.user.role === UserRole.ADMIN && !isInternal && (complaint as any).email && !(complaint as any).isAnonymous) {
      await sendNotifications(
        {
          email: (complaint as any).email,
          phoneNumber: (complaint as any).phoneNumber,
        },
        "newComment",
        {
          trackingId: complaint.trackingId,
          comment: content,
        },
      )
    }

    res.status(201).json({
      status: "success",
      data: {
        comment: commentWithUser,
      },
    })
  } catch (error) {
    next(error)
  }
}
// Admin: Get all complaints with filtering and pagination
export const getAllComplaints = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 10, status, priority, categoryId, subcategoryId, search, startDate, endDate } = req.query

    const pageNumber = Number.parseInt(page as string, 10)
    const limitNumber = Number.parseInt(limit as string, 10)
    const offset = (pageNumber - 1) * limitNumber

    // Build where clause for filtering
    const whereClause: any = {}

    if (status) {
      whereClause.status = status
    }

    if (priority) {
      whereClause.priority = priority
    }

    if (categoryId) {
      whereClause.categoryId = categoryId
    }

    if (subcategoryId) {
      whereClause.subcategoryId = subcategoryId
    }

    if (search) {
      whereClause[Op.or] = [
        { trackingId: { [Op.iLike]: `%${search}%` } },
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { location: { [Op.iLike]: `%${search}%` } },
      ]
    }

    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)],
      }
    } else if (startDate) {
      whereClause.createdAt = {
        [Op.gte]: new Date(startDate as string),
      }
    } else if (endDate) {
      whereClause.createdAt = {
        [Op.lte]: new Date(endDate as string),
      }
    }

    // Get total count for pagination
    const totalComplaints = await Complaint.count({ where: whereClause })

    // Get complaints with pagination
    const complaints = await Complaint.findAll({
      where: whereClause,
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name"],
        },
        {
          model: Subcategory,
          as: "subcategory",
          attributes: ["id", "name"],
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "firstName", "lastName", "email"],
        },
        {
          model: User,
          as: "assignedUser",
          attributes: ["id", "firstName", "lastName"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: limitNumber,
      offset,
    })

    res.status(200).json({
      status: "success",
      results: complaints.length,
      pagination: {
        total: totalComplaints,
      },
      data: {
        complaints,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Admin: Update complaint status
export const updateComplaintStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const { status, rejectionReason, comment } = req.body
    const userId = req.user.id

    const complaint = await Complaint.findByPk(id)
    if (!complaint) {
      return next(new AppError("Complaint not found", 404))
    }

    // Validate status transition
    if (!Object.values(ComplaintStatus).includes(status as ComplaintStatus)) {
      return next(new AppError("Invalid status", 400))
    }

    const previousStatus = complaint.status

    // Update complaint status
    const updateData: any = { status }

    // Add additional fields based on status
    if (status === ComplaintStatus.RESOLVED) {
      updateData.resolvedAt = new Date()
    } else if (status === ComplaintStatus.CLOSED) {
      updateData.closedAt = new Date()
    } else if (status === ComplaintStatus.REJECTED) {
      if (!rejectionReason) {
        return next(new AppError("Rejection reason is required", 400))
      }
      updateData.rejectionReason = rejectionReason
    }

    await complaint.update(updateData)

    // Record status change in history
    await StatusHistory.create({
      complaintId: id,
      previousStatus,
      newStatus: status,
      comment: comment || rejectionReason,
      changedBy: userId,
    })

    // Send notification if contact information is available and not anonymous
    if (!complaint.isAnonymous && ((complaint as any).email || (complaint as any).phoneNumber)) {
      const notificationType = getNotificationTypeFromStatus(status)
      await sendNotifications(
        {
          email: (complaint as any).email,
          phoneNumber: (complaint as any).phoneNumber,
        },
        notificationType,
        {
          trackingId: complaint.trackingId,
          status,
          comment,
          reason: rejectionReason,
        },
      )
    }

    res.status(200).json({
      status: "success",
      data: {
        complaint,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Admin: Assign complaint to user
export const assignComplaint = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const { assignedTo } = req.body

    const complaint = await Complaint.findByPk(id)
    if (!complaint) {
      return next(new AppError("Complaint not found", 404))
    }

    // Check if assigned user exists and is an admin
    if (assignedTo) {
      const assignedUser = await User.findOne({
        where: { id: assignedTo, role: UserRole.ADMIN },
      })
      if (!assignedUser) {
        return next(new AppError("Assigned user not found or is not an admin", 404))
      }
    }

    const previousStatus = complaint.status
    const newStatus = assignedTo ? ComplaintStatus.UNDER_REVIEW : complaint.status

    await complaint.update({
      assignedTo: assignedTo || null,
      status: newStatus,
    })

    // Record status change in history if status changed
    if (previousStatus !== newStatus) {
      await StatusHistory.create({
        complaintId: id,
        previousStatus,
        newStatus,
        comment: assignedTo ? "Complaint assigned for review" : "Complaint assignment removed",
        changedBy: req.user.id,
      })

      // Send notification if status changed and contact information is available
      if (!complaint.isAnonymous && ((complaint as any).email || (complaint as any).phoneNumber)) {
        await sendNotifications(
          {
            email: (complaint as any).email,
            phoneNumber: (complaint as any).phoneNumber,
          },
          "statusUpdate",
          {
            trackingId: complaint.trackingId,
            status: newStatus,
            comment: assignedTo ? "Your complaint has been assigned to an administrator for review." : null,
          },
        )
      }
    }

    res.status(200).json({
      status: "success",
      data: {
        complaint,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Admin: Update complaint priority
export const updateComplaintPriority = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const { priority } = req.body

    const complaint = await Complaint.findByPk(id)
    if (!complaint) {
      return next(new AppError("Complaint not found", 404))
    }

    // Validate priority
    if (!Object.values(ComplaintPriority).includes(priority as ComplaintPriority)) {
      return next(new AppError("Invalid priority", 400))
    }
    await complaint.update({ priority })

    res.status(200).json({
      status: "success",
      data: {
        complaint,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Get complaint statistics
export const getComplaintStatistics = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // Get counts by status
    const statusCounts = await Complaint.findAll({
      attributes: ["status", [sequelize.fn("COUNT", sequelize.col("status")), "count"]],
      group: ["status"],
    })

    // Get counts by category
    const categoryCounts = await Complaint.findAll({
      attributes: ["categoryId", [sequelize.fn("COUNT", sequelize.col("categoryId")), "count"]],
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["name"],
        },
      ],
      group: ["categoryId", "category.id", "category.name"],
    })

    // Get counts by priority
    const priorityCounts = await Complaint.findAll({
      attributes: ["priority", [sequelize.fn("COUNT", sequelize.col("priority")), "count"]],
      group: ["priority"],
    })

    // Get total complaints
    const totalComplaints = await Complaint.count()

    // Get complaints created in the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const recentComplaints = await Complaint.count({
      where: {
        createdAt: {
          [Op.gte]: thirtyDaysAgo,
        },
      },
    })

    res.status(200).json({
      status: "success",
      data: {
        total: totalComplaints,
        recent: recentComplaints,
        byStatus: statusCounts,
        byCategory: categoryCounts,
        byPriority: priorityCounts,
      },
    })
  } catch (error) {
    next(error)
  }
 }