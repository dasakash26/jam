import type { ContentfulStatusCode } from "hono/utils/http-status";

export type StatusCode = ContentfulStatusCode;

export class AppError extends Error {
  public readonly statusCode: ContentfulStatusCode;
  public readonly code?: string;

  constructor(message: string, statusCode: ContentfulStatusCode = 500, code?: string) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = "Bad Request", code: string = "BAD_REQUEST") {
    super(message, 400, code);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Not Found", code: string = "NOT_FOUND") {
    super(message, 404, code);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = "Validation Error", code: string = "VALIDATION_ERROR") {
    super(message, 400, code);
  }
}

export class UpstreamError extends AppError {
  constructor(
    message: string = "Upstream Service Error",
    statusCode: ContentfulStatusCode = 502,
    code: string = "UPSTREAM_ERROR"
  ) {
    super(message, statusCode, code);
  }
}
