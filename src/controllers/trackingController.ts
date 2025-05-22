import type { Request, Response, NextFunction } from "express"
import Complaint from "../database/models/Complaint"
import StatusHistory from "../database/models/StatusHistory"
import User from "../database/models/User"
import { AppError } from "../utils/appError"

/**
 * Validate a tracking ID
 * @param req Request object
 * @param res Response object
 * @param next Next function
 */
export const validateTrackingId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { trackingId } = req.body

    // Check if tracking ID is provided
    if (!trackingId) {
      return next(new AppError("Please enter a tracking ID", 400))
    }

    // Validate tracking ID format
    if (!trackingId.match(/^IJW-\d{4}-\d{5}$/)) {
      return next(
        new AppError("Invalid tracking ID format. Please enter a valid tracking ID (e.g. IJW-2025-12345)", 400),
      )
    }

    // Check if complaint exists
    const complaint = await Complaint.findOne({
      where: { trackingId },
      attributes: ["id", "trackingId", "status", "createdAt"],
    })

    if (!complaint) {
      return next(new AppError("No complaint found with this tracking ID. Please check and try again.", 404))
    }

    res.status(200).json({
      status: "success",
      data: {
        valid: true,
        trackingId: complaint.trackingId,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Get complaint status history
 * @param req Request object
 * @param res Response object
 * @param next Next function
 */
export const getComplaintStatusHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { trackingId } = req.params

    // Validate tracking ID format
    if (!trackingId || !trackingId.match(/^IJW-\d{4}-\d{5}$/)) {
      return next(
        new AppError("Invalid tracking ID format. Please enter a valid tracking ID (e.g. IJW-2025-12345)", 400),
      )
    }

    // Get complaint
    const complaint = await Complaint.findOne({
      where: { trackingId },
      attributes: ["id", "trackingId", "status", "createdAt", "updatedAt", "resolvedAt", "closedAt"],
    })

    if (!complaint) {
      return next(new AppError("No complaint found with this tracking ID. Please check and try again.", 404))
    }

    // Get status history from database
    const statusHistoryRecords = await StatusHistory.findAll({
      where: { complaintId: complaint.id },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          as: "user",
          attributes: ["firstName", "lastName"],
        },
      ],
    })

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

    // Create initial status entry for submission
    const statusHistory: { status: string; date: string | null; description: string; changedBy: string | null }[] = [
      {
        status: "Submitted",
        date: formatDate(complaint.createdAt),
        description: "Your complaint has been successfully submitted.",
        changedBy: null,
      },
    ]

    // Add entries from status history records
    statusHistoryRecords.forEach((record) => {
      statusHistory.push({
        status: record.newStatus,
        date: formatDate(record.createdAt),
        description: record.comment || `Status changed from ${record.previousStatus} to ${record.newStatus}`,
        changedBy: record.user ? `${record.user.firstName} ${record.user.lastName}` : null,
      })
    })

    res.status(200).json({
      status: "success",
      data: {
        trackingId: complaint.trackingId,
        currentStatus: complaint.status,
        statusHistory,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Make sure both functions are exported
