import { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'
import { deleteUploadedFiles } from '../../utils/fileCleanup'
import { STATUS_CODE } from '../../utils/constant'


export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  //cleanup uploaded files if any
  if (req.file || req.files) {
    deleteUploadedFiles(req.file || req.files)
  }

  let statusCode = err.statusCode || 500
  let message = err.message || 'Something went wrong'
  if (err instanceof ZodError) {

    const message = err.issues.map((issue) => issue.message)[0]

    return res.status(400).json({
      statusCode:STATUS_CODE.BAD_REQUEST,
      success: false,
      message,
    })
  }
  // MongoDB invalid ObjectId
  if (err.name === 'CastError') {
    statusCode = 400
    message = 'Invalid ID format'
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    statusCode = 409
    const field = Object.keys(err.keyValue)[0]
    message = `${field
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (c) => c.toUpperCase())} already exists`
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400

    const fields = Object.keys(err.errors).map((field) =>
      field.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()),
    )

    if (fields.length === 1) {
      message = `${fields[0]} is required.`
    } else if (fields.length === 2) {
      message = `${fields[0]} and ${fields[1]} are required.`
    } else {
      message = `${fields.slice(0, -1).join(", ")} and ${
        fields[fields.length - 1]
      } are required.`
    }
  }

  res.status(statusCode).json({
    statusCode,
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
    }),
  })
}
