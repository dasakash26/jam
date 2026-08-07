import {HTTPException} from 'hono/http-exception'
import {AppError} from '../utils/errors'
import type {Context} from 'hono'

export function handleError(err: Error, c: Context) {
  console.error('Unhandled Server Error:', err)

  if (err instanceof AppError) {
    return c.json(
      {
        success: false,
        error: err.message,
        code: err.code,
      },
      err.statusCode,
    )
  }

  if (err instanceof HTTPException) {
    return c.json(
      {
        success: false,
        error: err.message,
      },
      err.status,
    )
  }

  return c.json(
    {
      success: false,
      error: err.message || 'An unexpected internal server error occurred.',
    },
    500,
  )
}
