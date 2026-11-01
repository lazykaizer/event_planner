/**
 * Standardized application error hierarchy and response formatters.
 *
 * Implements clean architecture error handling:
 * - Domain-specific typed error classes
 * - Safe error message sanitization (no stack trace leak)
 * - Uniform JSON API response formatting
 */

import { NextResponse } from 'next/server';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR', isOperational = true) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  public readonly fieldErrors?: Record<string, string[] | undefined>;

  constructor(message = 'Validation failed', fieldErrors?: Record<string, string[] | undefined>) {
    super(message, 400, 'VALIDATION_ERROR');
    this.fieldErrors = fieldErrors;
  }
}

export class RateLimitError extends AppError {
  public readonly retryAfterSeconds: number;

  constructor(message = 'Rate limit exceeded. Please wait a moment before trying again.', retryAfterSeconds = 60) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export class ExternalServiceError extends AppError {
  constructor(message = 'Upstream AI service error. Please retry.') {
    super(message, 502, 'UPSTREAM_SERVICE_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

/**
 * Transforms an unknown error caught in an API route into a standardized,
 * sanitized NextResponse with appropriate HTTP status codes and headers.
 */
export function handleApiError(error: unknown): NextResponse {
  if (error instanceof AppError) {
    const responseBody: Record<string, unknown> = {
      success: false,
      error: error.message,
      code: error.code,
    };

    if (error instanceof ValidationError && error.fieldErrors) {
      responseBody.details = error.fieldErrors;
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (error instanceof RateLimitError) {
      headers['Retry-After'] = String(error.retryAfterSeconds);
    }

    return NextResponse.json(responseBody, { status: error.statusCode, headers });
  }

  // Handle generic / unexpected native errors
  const message = error instanceof Error ? error.message : 'Internal server error';
  return NextResponse.json(
    {
      success: false,
      error: message,
      code: 'INTERNAL_SERVER_ERROR',
    },
    { status: 500 }
  );
}
