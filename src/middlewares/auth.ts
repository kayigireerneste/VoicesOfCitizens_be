import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import User, { UserRole } from "../database/models/User"
import { AppError } from "../utils/appError"

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any
    }
  }
}

// JWT token interface
interface TokenPayload {
  id: string
  role: UserRole
}

// Middleware to authenticate JWT token
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new AppError("Authentication required. Please login.", 401))
    }

    const token = authHeader.split(" ")[1]

    if (!token) {
      return next(new AppError("Authentication token missing", 401))
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as TokenPayload

    const user = await User.findByPk(decoded.id)

    if (!user) {
      return next(new AppError("User not found", 401))
    }

    req.user = user
    next()
  } catch (error) {
    return next(new AppError("Invalid or expired token", 401))
  }
}

// Middleware to check if user is admin
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === UserRole.ADMIN) {
    next()
  } else {
    return next(new AppError("Access denied. Admin privileges required.", 403))
  }
}

// Middleware to check if user is citizen
export const isCitizen = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === UserRole.CITIZEN) {
    next()
  } else {
    return next(new AppError("Access denied. Citizen privileges required.", 403))
  }
}

// Middleware to check if user is verified
export const isVerified = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.isVerified) {
    next()
  } else {
    return next(new AppError("Email verification required. Please verify your email.", 403))
  }
}
