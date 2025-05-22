import express from "express"
import { validateTrackingId, getComplaintStatusHistory } from "../controllers/trackingController"
import { getComplaintByTrackingId } from "../controllers/complaintController"

const router = express.Router()

/**
 * @swagger
 * /api/tracking/validate:
 *   post:
 *     summary: Validate a tracking ID
 *     tags: [Tracking]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - trackingId
 *             properties:
 *               trackingId:
 *                 type: string
 *                 example: IJW-2025-12345
 *     responses:
 *       200:
 *         description: Valid tracking ID
 *       400:
 *         description: Invalid tracking ID format
 *       404:
 *         description: No complaint found with this tracking ID
 */
router.post("/validate", validateTrackingId)

/**
 * @swagger
 * /api/tracking/{trackingId}:
 *   get:
 *     summary: Get complaint details by tracking ID
 *     tags: [Tracking]
 *     parameters:
 *       - in: path
 *         name: trackingId
 *         required: true
 *         schema:
 *           type: string
 *         example: IJW-2025-12345
 *     responses:
 *       200:
 *         description: Complaint details
 *       400:
 *         description: Invalid tracking ID format
 *       404:
 *         description: No complaint found with this tracking ID
 */
router.get("/:trackingId", getComplaintByTrackingId)

/**
 * @swagger
 * /api/tracking/{trackingId}/history:
 *   get:
 *     summary: Get complaint status history
 *     tags: [Tracking]
 *     parameters:
 *       - in: path
 *         name: trackingId
 *         required: true
 *         schema:
 *           type: string
 *         example: IJW-2025-12345
 *     responses:
 *       200:
 *         description: Complaint status history
 *       400:
 *         description: Invalid tracking ID format
 *       404:
 *         description: No complaint found with this tracking ID
 */
router.get("/:trackingId/history", getComplaintStatusHistory)

export default router
