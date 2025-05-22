import multer from "multer"
import path from "path"
import fs from "fs"
import type { Request, Response, NextFunction } from "express"
import { AppError } from "../utils/appError"

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), "uploads")
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    // Create a unique filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    const fileExtension = path.extname(file.originalname)
    cb(null, `${file.fieldname}-${uniqueSuffix}${fileExtension}`)
  },
})

// File filter function
const fileFilter = (req: Request, file: any, cb: multer.FileFilterCallback) => {
  // Define allowed file types
  const allowedFileTypes = [
    // Images
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    // Documents
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
  ]

  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(
      new Error(
        "Invalid file type. Only JPG, PNG, GIF, WEBP, PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, and TXT files are allowed.",
      ),
    )
  }
}

// Create multer upload instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
})

// Middleware to handle file upload errors
export const handleFileUploadErrors = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return next(new AppError("File size exceeds the 10MB limit", 400))
    }
    return next(new AppError(`File upload error: ${err.message}`, 400))
  } else if (err) {
    return next(new AppError(err.message, 400))
  }
  next()
}
