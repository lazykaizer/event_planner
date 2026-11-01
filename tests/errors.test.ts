import { describe, it, expect } from 'vitest';
import {
  AppError,
  ValidationError,
  RateLimitError,
  ExternalServiceError,
  NotFoundError,
  handleApiError,
} from '@/lib/errors';

describe('Clean Architecture Error Classes', () => {
  it('instantiates AppError with default properties', () => {
    const err = new AppError('Server error', 500, 'SERVER_ERR');
    expect(err.message).toBe('Server error');
    expect(err.statusCode).toBe(500);
    expect(err.code).toBe('SERVER_ERR');
    expect(err.isOperational).toBe(true);
  });

  it('instantiates ValidationError with 400 and field errors', () => {
    const fieldErrors = { budget: ['Budget must be positive'] };
    const err = new ValidationError('Invalid budget', fieldErrors);
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe('VALIDATION_ERROR');
    expect(err.fieldErrors).toEqual(fieldErrors);
  });

  it('instantiates RateLimitError with 429 and retryAfterSeconds', () => {
    const err = new RateLimitError('Too many requests', 30);
    expect(err.statusCode).toBe(429);
    expect(err.code).toBe('RATE_LIMIT_EXCEEDED');
    expect(err.retryAfterSeconds).toBe(30);
  });

  it('instantiates ExternalServiceError with 502', () => {
    const err = new ExternalServiceError('Upstream failure');
    expect(err.statusCode).toBe(502);
    expect(err.code).toBe('UPSTREAM_SERVICE_ERROR');
  });

  it('instantiates NotFoundError with 404', () => {
    const err = new NotFoundError('Quote not found');
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe('NOT_FOUND');
  });

  it('handles AppError and converts to structured NextResponse', async () => {
    const err = new ValidationError('Bad input', { quoteText: ['Required'] });
    const response = handleApiError(err);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toBe('Bad input');
    expect(data.details).toEqual({ quoteText: ['Required'] });
  });

  it('handles native Error and converts to safe sanitized 500 response', async () => {
    const err = new Error('Database connection failed');
    const response = handleApiError(err);
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toBe('Database connection failed');
    expect(data.code).toBe('INTERNAL_SERVER_ERROR');
  });
});
