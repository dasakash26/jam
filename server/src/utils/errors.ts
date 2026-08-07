import type {ContentfulStatusCode} from 'hono/utils/http-status'

export type StatusCode = ContentfulStatusCode

export class AppError extends Error {
  public readonly statusCode: ContentfulStatusCode
  public readonly code?: string

  constructor(message: string, statusCode: ContentfulStatusCode = 500, code?: string) {
    super(message)
    this.name = this.constructor.name
    this.statusCode = statusCode
    this.code = code
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = 'Bad Request', code: string = 'BAD_REQUEST') {
    super(message, 400, code)
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Not Found', code: string = 'NOT_FOUND') {
    super(message, 404, code)
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation Error', code: string = 'VALIDATION_ERROR') {
    super(message, 400, code)
  }
}

export class UpstreamError extends AppError {
  constructor(
    message: string = 'Upstream Service Error',
    statusCode: ContentfulStatusCode = 502,
    code: string = 'UPSTREAM_ERROR',
  ) {
    super(message, statusCode, code)
  }
}

export function handleValidationError(result: {success: boolean; error?: unknown}) {
  if (!result.success) {
    let errorDetails = 'Invalid request payload'
    if (result.error) {
      const errObj = result.error as
        | {issues?: Array<{path?: unknown[]; message?: string}>}
        | Array<{path?: unknown[]; message?: string}>
      const issues = Array.isArray(errObj) ? errObj : errObj.issues
      if (issues && issues.length > 0) {
        errorDetails = issues
          .map(
            (i) =>
              `${Array.isArray(i.path) ? i.path.join('.') : 'value'}: ${i.message || 'invalid'}`,
          )
          .join('; ')
      }
    }
    throw new ValidationError(`Validation Error: ${errorDetails}`)
  }
}
