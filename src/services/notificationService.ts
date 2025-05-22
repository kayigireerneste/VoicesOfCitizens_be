import nodemailer from "nodemailer"
import twilio from "twilio"
import dotenv from "dotenv"
import { ComplaintStatus } from "../database/models"

dotenv.config()

// Create nodemailer transporter
const emailTransporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: Number.parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})

// Initialize Twilio client
const twilioClient =
  process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null

// Email templates for different status updates
const emailTemplates = {
  submitted: (trackingId: string, category: string) => ({
    subject: `Complaint Submitted - Tracking ID: ${trackingId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Complaint Submitted Successfully</h2>
        <p>Thank you for submitting your complaint to Ijwi ry'Abaturage. Your voice matters to us.</p>
        <p><strong>Tracking ID:</strong> ${trackingId}</p>
        <p><strong>Category:</strong> ${category}</p>
        <p>You can track the status of your complaint using the tracking ID above by visiting our website or clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/track-complaint?id=${trackingId}" style="background-color: #16a085; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Track Your Complaint</a>
        </div>
        <p>We will notify you of any updates regarding your complaint.</p>
        <p>Best regards,<br>The Ijwi ry'Abaturage Team</p>
      </div>
    `,
  }),
  statusUpdate: (trackingId: string, status: string, comment: string | null) => ({
    subject: `Complaint Status Update - Tracking ID: ${trackingId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Complaint Status Update</h2>
        <p>The status of your complaint has been updated.</p>
        <p><strong>Tracking ID:</strong> ${trackingId}</p>
        <p><strong>New Status:</strong> ${status}</p>
        ${comment ? `<p><strong>Comment:</strong> ${comment}</p>` : ""}
        <p>You can view more details about your complaint by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/track-complaint?id=${trackingId}" style="background-color: #16a085; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">View Complaint Details</a>
        </div>
        <p>Thank you for using Ijwi ry'Abaturage to help improve public services.</p>
        <p>Best regards,<br>The Ijwi ry'Abaturage Team</p>
      </div>
    `,
  }),
  resolved: (trackingId: string, comment: string | null) => ({
    subject: `Complaint Resolved - Tracking ID: ${trackingId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Complaint Resolved</h2>
        <p>We are pleased to inform you that your complaint has been resolved.</p>
        <p><strong>Tracking ID:</strong> ${trackingId}</p>
        ${comment ? `<p><strong>Resolution Details:</strong> ${comment}</p>` : ""}
        <p>You can view more details about the resolution by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/track-complaint?id=${trackingId}" style="background-color: #16a085; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">View Resolution Details</a>
        </div>
        <p>We would appreciate your feedback on how your complaint was handled. Please take a moment to rate our service by clicking the link in the complaint details page.</p>
        <p>Thank you for using Ijwi ry'Abaturage to help improve public services.</p>
        <p>Best regards,<br>The Ijwi ry'Abaturage Team</p>
      </div>
    `,
  }),
  rejected: (trackingId: string, reason: string) => ({
    subject: `Complaint Status Update - Tracking ID: ${trackingId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Complaint Status Update</h2>
        <p>We regret to inform you that your complaint could not be processed further.</p>
        <p><strong>Tracking ID:</strong> ${trackingId}</p>
        <p><strong>Status:</strong> Rejected</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p>You can view more details about your complaint by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/track-complaint?id=${trackingId}" style="background-color: #16a085; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">View Complaint Details</a>
        </div>
        <p>If you have any questions or need further clarification, please contact our support team.</p>
        <p>Thank you for using Ijwi ry'Abaturage.</p>
        <p>Best regards,<br>The Ijwi ry'Abaturage Team</p>
      </div>
    `,
  }),
  newComment: (trackingId: string, comment: string) => ({
    subject: `New Comment on Your Complaint - Tracking ID: ${trackingId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">New Comment on Your Complaint</h2>
        <p>A new comment has been added to your complaint.</p>
        <p><strong>Tracking ID:</strong> ${trackingId}</p>
        <p><strong>Comment:</strong> ${comment}</p>
        <p>You can view the full conversation and respond by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/track-complaint?id=${trackingId}" style="background-color: #16a085; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">View Complaint Details</a>
        </div>
        <p>Thank you for using Ijwi ry'Abaturage.</p>
        <p>Best regards,<br>The Ijwi ry'Abaturage Team</p>
      </div>
    `,
  }),
}

// SMS templates for different status updates
const smsTemplates = {
  submitted: (trackingId: string) =>
    `Ijwi ry'Abaturage: Your complaint has been submitted successfully. Your tracking ID is ${trackingId}. Use this ID to check the status of your complaint at ${process.env.FRONTEND_URL}/track-complaint`,
  statusUpdate: (trackingId: string, status: string) =>
    `Ijwi ry'Abaturage: Your complaint (${trackingId}) status has been updated to "${status}". Check details at ${process.env.FRONTEND_URL}/track-complaint`,
  resolved: (trackingId: string) =>
    `Ijwi ry'Abaturage: Your complaint (${trackingId}) has been resolved. Please check the details and provide feedback at ${process.env.FRONTEND_URL}/track-complaint`,
  rejected: (trackingId: string) =>
    `Ijwi ry'Abaturage: Your complaint (${trackingId}) status has been updated. Please check the details at ${process.env.FRONTEND_URL}/track-complaint`,
  newComment: (trackingId: string) =>
    `Ijwi ry'Abaturage: A new comment has been added to your complaint (${trackingId}). View it at ${process.env.FRONTEND_URL}/track-complaint`,
}

// Send email notification
export const sendEmailNotification = async (
  email: string,
  type: "submitted" | "statusUpdate" | "resolved" | "rejected" | "newComment",
  data: {
    trackingId: string
    category?: string
    status?: string
    comment?: string | null
    reason?: string
  },
) => {
  try {
    if (!email) return false

    let template
    switch (type) {
      case "submitted":
        template = emailTemplates.submitted(data.trackingId, data.category || "")
        break
      case "statusUpdate":
        template = emailTemplates.statusUpdate(data.trackingId, data.status || "", data.comment || null)
        break
      case "resolved":
        template = emailTemplates.resolved(data.trackingId, data.comment || null)
        break
      case "rejected":
        template = emailTemplates.rejected(data.trackingId, data.reason || "")
        break
      case "newComment":
        template = emailTemplates.newComment(data.trackingId, data.comment || "")
        break
      default:
        throw new Error("Invalid notification type")
    }

    const mailOptions = {
      from: `"Ijwi ry'Abaturage" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: template.subject,
      html: template.html,
    }

    await emailTransporter.sendMail(mailOptions)
    return true
  } catch (error) {
    console.error("Email notification error:", error)
    return false
  }
}

// Send SMS notification
export const sendSmsNotification = async (
  phoneNumber: string,
  type: "submitted" | "statusUpdate" | "resolved" | "rejected" | "newComment",
  data: {
    trackingId: string
    status?: string
  },
) => {
  try {
    if (!phoneNumber || !twilioClient) return false

    // Format phone number if needed
    const formattedPhoneNumber = phoneNumber.startsWith("+") ? phoneNumber : `+${phoneNumber}`

    let message
    switch (type) {
      case "submitted":
        message = smsTemplates.submitted(data.trackingId)
        break
      case "statusUpdate":
        message = smsTemplates.statusUpdate(data.trackingId, data.status || "")
        break
      case "resolved":
        message = smsTemplates.resolved(data.trackingId)
        break
      case "rejected":
        message = smsTemplates.rejected(data.trackingId)
        break
      case "newComment":
        message = smsTemplates.newComment(data.trackingId)
        break
      default:
        throw new Error("Invalid notification type")
    }

    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhoneNumber,
    })
    return true
  } catch (error) {
    console.error("SMS notification error:", error)
    return false
  }
}

// Send both email and SMS notifications
export const sendNotifications = async (
  contactInfo: {
    email?: string | null
    phoneNumber?: string | null
  },
  type: "submitted" | "statusUpdate" | "resolved" | "rejected" | "newComment",
  data: {
    trackingId: string
    category?: string
    status?: string
    comment?: string | null
    reason?: string
  },
) => {
  const results = {
    email: false,
    sms: false,
  }

  // Send email if available
  if (contactInfo.email) {
    results.email = await sendEmailNotification(contactInfo.email, type, data)
  }

  // Send SMS if available
  if (contactInfo.phoneNumber) {
    results.sms = await sendSmsNotification(contactInfo.phoneNumber, type, {
      trackingId: data.trackingId,
      status: data.status,
    })
  }

  return results
}

// Get notification type based on complaint status
export const getNotificationTypeFromStatus = (status: string): "statusUpdate" | "resolved" | "rejected" => {
  switch (status) {
    case ComplaintStatus.RESOLVED:
      return "resolved"
    case ComplaintStatus.REJECTED:
      return "rejected"
    default:
      return "statusUpdate"
  }
}
