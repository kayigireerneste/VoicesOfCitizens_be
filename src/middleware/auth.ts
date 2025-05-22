import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import User, { UserRole } from "../models/User"

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
      return res.status(401).json({ message: "Authentication required. Please login." })
    }

    const token = authHeader.split(" ")[1]

    if (!token) {
      return res.status(401).json({ message: "Authentication token missing" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as TokenPayload

    const user = await User.findByPk(decoded.id)

    if (!user) {
      return res.status(401).json({ message: "User not found" })
    }

    req.user = user
    next()
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" })
  }
}

// Middleware to check if user is admin
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === UserRole.ADMIN) {
    next()
  } else {
    return res.status(403).json({ message: "Access denied. Admin privileges required." })
  }
}

// Middleware to check if user is citizen
export const isCitizen = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === UserRole.CITIZEN) {
    next()
  } else {
    return res.status(403).json({ message: "Access denied. Citizen privileges required." })
  }
}

// Middleware to check if user is verified
export const isVerified = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.isVerified) {
    next()
  } else {
    return res.status(403).json({ message: "Email verification required. Please verify your email." })
  }
}
