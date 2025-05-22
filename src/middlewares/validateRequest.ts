import type { Request, Response, NextFunction } from "express"
import type Joi from "joi"

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { abortEarly: false })

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }))

      res.status(400).json({
        status: "error",
        message: "Validation error",
        errors,
      })
      return
    }

    next()
  }
}
