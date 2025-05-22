import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import crypto from "crypto"
import User, { UserRole } from "../database/models/User"
import { sendVerificationEmail, sendPasswordResetEmail } from "../services/emailService"
import { AppError } from "../utils/appError"
import { Op } from "sequelize"

// Extend Express Request interface to include 'user'
declare global {
  namespace Express {
    interface Request {
      user?: any
    }
  }
}

// Generate JWT token
const generateToken = (id: string, role: UserRole): string => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || "your-secret-key", {
    expiresIn: "24h",
  })
}

// Register a new user
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { firstName, lastName, email, password, phoneNumber, role } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } })
    if (existingUser) {
      return next(new AppError("User with this email already exists", 400))
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex")

    // Create new user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      role: role === "admin" ? UserRole.ADMIN : UserRole.CITIZEN,
      isVerified: false,
      verificationToken,
    })

    // Send verification email
    await sendVerificationEmail(user.email, verificationToken)

    // Return success response without sensitive data
    res.status(201).json({
      status: "success",
      message: "Registration successful. Please check your email to verify your account.",
      data: {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        },
      },
    })
  } catch (error) {
    next(error)
  }
}

// Login user
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body

    // Find user by email
    const user = await User.findOne({ where: { email } })
    if (!user) {
      return next(new AppError("Invalid email or password", 401))
    }

    // Validate password
    const isPasswordValid = await user.validatePassword(password)
    if (!isPasswordValid) {
      return next(new AppError("Invalid email or password", 401))
    }

    // Check if user is verified
    if (!user.isVerified) {
      return next(new AppError("Please verify your email before logging in", 401))
    }

    // Generate JWT token
    const token = generateToken(user.id, user.role)

    // Return user data and token
    res.status(200).json({
      status: "success",
      message: "Login successful",
      data: {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        },
        token,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Verify email
export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.params

    // Find user by verification token
    const user = await User.findOne({ where: { verificationToken: token } })
    if (!user) {
      return next(new AppError("Invalid or expired verification token", 400))
    }

    // Update user verification status
    user.isVerified = true
    user.verificationToken = undefined
    await user.save()

    res.status(200).json({
      status: "success",
      message: "Email verified successfully. You can now login.",
    })
  } catch (error) {
    next(error)
  }
}

// Request password reset
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body

    // Find user by email
    const user = await User.findOne({ where: { email } })
    if (!user) {
      return next(new AppError("User not found", 404))
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex")
    const resetPasswordToken = resetToken
    const resetPasswordExpires = new Date(Date.now() + 3600000) // 1 hour

    // Update user with reset token
    user.resetPasswordToken = resetPasswordToken
    user.resetPasswordExpires = resetPasswordExpires
    await user.save()

    // Send password reset email
    await sendPasswordResetEmail(user.email, resetToken)

    res.status(200).json({
      status: "success",
      message: "Password reset email sent",
    })
  } catch (error) {
    next(error)
  }
}

// Reset password
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.params
    const { password } = req.body

    // Find user by reset token and check if token is expired
    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: new Date() },
      },
    })

    if (!user) {
      return next(new AppError("Invalid or expired reset token", 400))
    }

    // Update user password
    user.password = password
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save()

    res.status(200).json({
      status: "success",
      message: "Password reset successful. You can now login with your new password.",
    })
  } catch (error) {
    next(error)
  }
}

// Get current user profile
export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user

    res.status(200).json({
      status: "success",
      data: {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role,
          isVerified: user.isVerified,
        },
      },
    })
  } catch (error) {
    next(error)
  }
}
