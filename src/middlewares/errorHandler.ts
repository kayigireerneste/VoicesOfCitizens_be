import type { ErrorRequestHandler } from "express"
import { AppError } from "../utils/appError"

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error("Error:", err)

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    return;
  }

  // Handle Sequelize validation errors
  if (err.name === "SequelizeValidationError" || err.name === "SequelizeUniqueConstraintError") {
    res.status(400).json({
      status: "error",
      message: "Validation error",
      errors: (err as any).errors.map((e: any) => ({
        field: e.path,
        message: e.message,
      })),
    });
    return;
  }

  // Default error response
  res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
  return;
}
