import { v2 as cloudinary } from "cloudinary"
import fs from "fs"
import dotenv from "dotenv"
import type { Express } from "express"

dotenv.config()

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Upload file to Cloudinary
export const uploadToCloudinary = async (file: Express.Multer.File) => {
  try {
    // Create a folder structure based on date to organize uploads
    const date = new Date()
    const folder = `ijwi_ryabaturage/complaints/${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`

    // Upload file to Cloudinary
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload(file.path, {
          folder,
          resource_type: "auto", // auto-detect file type
          public_id: `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`,
        })
        .then((result) => {
          // Remove temporary file after upload
          fs.unlinkSync(file.path)
          resolve(result)
        })
        .catch((error) => {
          reject(error)
        })
    })

    return result
  } catch (error) {
    // Remove temporary file if upload fails
    if (file.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path)
    }
    throw error
  }
}

// Delete file from Cloudinary
export const deleteFromCloudinary = async (publicId: string) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return result
  } catch (error) {
    throw error
  }
}

// Get resource type from file mimetype
export const getResourceType = (mimetype: string) => {
  if (mimetype.startsWith("image/")) {
    return "image"
  } else if (mimetype.startsWith("video/")) {
    return "video"
  } else {
    return "raw"
  }
}
