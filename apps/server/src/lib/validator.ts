import { zValidator } from "@hono/zod-validator"
import { sendError } from "./apiResponse"

export const validateJson = (schema: any) =>
  zValidator('json', schema, (result, c) => {
    if (!result.success) {
      const formattedErrors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }))

      return sendError(
        {
          c,
          message: formattedErrors[0]?.message || 'Validation failed',
          errors: formattedErrors
        }
      )
    }
  })
