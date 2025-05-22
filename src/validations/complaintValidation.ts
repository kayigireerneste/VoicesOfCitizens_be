import Joi from "joi"
import { ComplaintStatus, ComplaintPriority } from "../database/models"

// Complaint submission validation schema
export const submitComplaintSchema = Joi.object({
  title: Joi.string().max(255).allow("", null),
  description: Joi.string().required().min(10).max(5000).messages({
    "string.empty": "Description is required",
    "string.min": "Description must be at least 10 characters",
    "string.max": "Description cannot exceed 5000 characters",
  }),
  location: Joi.string().required().min(3).max(255).messages({
    "string.empty": "Location is required",
    "string.min": "Location must be at least 3 characters",
    "string.max": "Location cannot exceed 255 characters",
  }),
  categoryId: Joi.string().uuid().required().messages({
    "string.empty": "Category is required",
    "string.guid": "Invalid category ID format",
  }),
  subcategoryId: Joi.string().uuid().required().messages({
    "string.empty": "Subcategory is required",
    "string.guid": "Invalid subcategory ID format",
  }),
  isAnonymous: Joi.boolean().default(false),
  fullName: Joi.when("isAnonymous", {
    is: false,
    then: Joi.string().min(3).max(100).required().messages({
      "string.empty": "Full name is required",
      "string.min": "Full name must be at least 3 characters",
      "string.max": "Full name cannot exceed 100 characters",
    }),
    otherwise: Joi.string().allow("", null),
  }),
  phoneNumber: Joi.when("isAnonymous", {
    is: false,
    then: Joi.string()
      .pattern(/^\+?[0-9]{10,15}$/)
      .required()
      .messages({
        "string.empty": "Phone number is required",
        "string.pattern.base": "Please provide a valid phone number",
      }),
    otherwise: Joi.string().allow("", null),
  }),
  email: Joi.string().email().allow("", null).messages({
    "string.email": "Please provide a valid email address",
  }),
})

// Comment validation schema
export const commentSchema = Joi.object({
  content: Joi.string().required().min(1).max(1000).messages({
    "string.empty": "Comment content is required",
    "string.min": "Comment content must not be empty",
    "string.max": "Comment content cannot exceed 1000 characters",
  }),
  isInternal: Joi.boolean().default(false),
})

// Update complaint status validation schema
export const updateStatusSchema = Joi.object({
  status: Joi.string()
    .valid(...Object.values(ComplaintStatus))
    .required()
    .messages({
      "string.empty": "Status is required",
      "any.only": "Invalid status value",
    }),
  rejectionReason: Joi.when("status", {
    is: ComplaintStatus.REJECTED,
    then: Joi.string().required().min(10).max(1000).messages({
      "string.empty": "Rejection reason is required",
      "string.min": "Rejection reason must be at least 10 characters",
      "string.max": "Rejection reason cannot exceed 1000 characters",
    }),
    otherwise: Joi.string().allow("", null),
  }),
})

// Update complaint priority validation schema
export const updatePrioritySchema = Joi.object({
  priority: Joi.string()
    .valid(...Object.values(ComplaintPriority))
    .required()
    .messages({
      "string.empty": "Priority is required",
      "any.only": "Invalid priority value",
    }),
})

// Assign complaint validation schema
export const assignComplaintSchema = Joi.object({
  assignedTo: Joi.string().uuid().allow(null).messages({
    "string.guid": "Invalid user ID format",
  }),
})

// Category validation schema
export const categorySchema = Joi.object({
  name: Joi.string().required().min(2).max(100).messages({
    "string.empty": "Category name is required",
    "string.min": "Category name must be at least 2 characters",
    "string.max": "Category name cannot exceed 100 characters",
  }),
  description: Joi.string().allow("", null).max(500).messages({
    "string.max": "Description cannot exceed 500 characters",
  }),
  isActive: Joi.boolean().default(true),
})

// Subcategory validation schema
export const subcategorySchema = Joi.object({
  name: Joi.string().required().min(2).max(100).messages({
    "string.empty": "Subcategory name is required",
    "string.min": "Subcategory name must be at least 2 characters",
    "string.max": "Subcategory name cannot exceed 100 characters",
  }),
  description: Joi.string().allow("", null).max(500).messages({
    "string.max": "Description cannot exceed 500 characters",
  }),
  categoryId: Joi.string().uuid().required().messages({
    "string.empty": "Category ID is required",
    "string.guid": "Invalid category ID format",
  }),
  isActive: Joi.boolean().default(true),
})
