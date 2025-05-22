import express from "express"
import {
  submitComplaint,
  getComplaintByTrackingId,
  getUserComplaints,
  addCommentToComplaint,
  getAllComplaints,
  updateComplaintStatus,
  assignComplaint,
  updateComplaintPriority,
  getComplaintStatistics,
} from "../controllers/complaintController"
import { authenticate, isAdmin, isVerified } from "../middlewares/auth"
import { validateRequest } from "../middlewares/validateRequest"
import { upload, handleFileUploadErrors } from "../middlewares/fileUpload"
import {
  submitComplaintSchema,
  commentSchema,
  updateStatusSchema,
  updatePrioritySchema,
  assignComplaintSchema,
} from "../validations/complaintValidation"

const router = express.Router()

/**
 * @swagger
 * /api/complaints:
 *   post:
 *     summary: Submit a new complaint
 *     tags: [Complaints]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - description
 *               - location
 *               - categoryId
 *               - subcategoryId
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               location:
 *                 type: string
 *               categoryId:
 *                 type: string
 *               subcategoryId:
 *                 type: string
 *               isAnonymous:
 *                 type: boolean
 *               fullName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               email:
 *                 type: string
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Complaint submitted successfully
 *       400:
 *         description: Bad request
 */
router.post(
  "/",
  upload.array("files", 5),
  handleFileUploadErrors,
  validateRequest(submitComplaintSchema),
  submitComplaint as express.RequestHandler, // type assertion for compatibility
)

/**
 * @swagger
 * /api/complaints/track/{trackingId}:
 *   get:
 *     summary: Get complaint by tracking ID
 *     tags: [Complaints]
 *     parameters:
 *       - in: path
 *         name: trackingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Complaint details
 *       404:
 *         description: Complaint not found
 */
router.get("/track/:trackingId", getComplaintByTrackingId)

/**
 * @swagger
 * /api/complaints/user:
 *   get:
 *     summary: Get user's complaints
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's complaints
 *       401:
 *         description: Unauthorized
router.get("/user", authenticate, isVerified, getUserComplaints as express.RequestHandler)

/**
 * @swagger
 * /api/complaints/{complaintId}/comments:
 *   post:
 *     summary: Add a comment to a complaint
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: complaintId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *               isInternal:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Comment added successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *       404:
 *         description: Complaint not found
 */
router.post("/:complaintId/comments", authenticate, isVerified, validateRequest(commentSchema), addCommentToComplaint as express.RequestHandler)

// Admin routes
/**
 * @swagger
 * /api/complaints/admin:
 *   get:
 *     summary: Get all complaints (admin)
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *         description: Filter by priority
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: subcategoryId
 *         schema:
 *           type: string
 *         description: Filter by subcategory
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering
 *     responses:
 *       200:
 *         description: List of complaints
 *       403:
 *         description: Forbidden
 */
router.get("/admin", authenticate, isAdmin, getAllComplaints as express.RequestHandler)

/**
 * @swagger
 * /api/complaints/admin/{id}:
 *   get:
 *     summary: Get complaint by ID (admin)
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Complaint details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Complaint not found
router.get("/admin/:id", authenticate, isAdmin, getComplaintById as express.RequestHandler)
 */
router.patch(
  "/admin/:id/status",
  authenticate,
  isAdmin,
  validateRequest(updateStatusSchema),
  updateComplaintStatus as express.RequestHandler,
)

router.patch(
  "/admin/:id/assign",
  authenticate,
  isAdmin,
  validateRequest(assignComplaintSchema),
  assignComplaint as express.RequestHandler,
)

router.patch(
  "/admin/:id/priority",
  authenticate,
  isAdmin,
  validateRequest(updatePrioritySchema),
  updateComplaintPriority as express.RequestHandler,
)

router.get(
  "/admin/statistics",
  authenticate,
  isAdmin,
  getComplaintStatistics as express.RequestHandler,
)

export default router