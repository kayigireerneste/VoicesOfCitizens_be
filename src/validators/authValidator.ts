import Joi from "joi"
import { UserRole } from "../models/User"

// Registration validation schema
export const validateRegistration = (data: any) => {
  const schema = Joi.object({
    firstName: Joi.string().required().min(2).max(50),
    lastName: Joi.string().required().min(2).max(50),
    email: Joi.string().email().required(),
    password: Joi.string()
      .required()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      .message(
        "Password must contain at least 8 characters, including uppercase, lowercase, number and special character",
      ),
    confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
      "any.only": "Passwords do not match",
    }),
    phoneNumber: Joi.string()
      .pattern(/^\+?[0-9]{10,15}$/)
      .allow("")
      .optional(),
    role: Joi.string()
      .valid(...Object.values(UserRole))
      .default(UserRole.CITIZEN),
  })

  return schema.validate(data)
}

// Login validation schema
export const validateLogin = (data: any) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  })

  return schema.validate(data)
}

// Password reset validation schema
export const validatePasswordReset = (data: any) => {
  const schema = Joi.object({
    password: Joi.string()
      .required()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      .message(
        "Password must contain at least 8 characters, including uppercase, lowercase, number and special character",
      ),
    confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
      "any.only": "Passwords do not match",
    }),
  })

  return schema.validate(data)
}
