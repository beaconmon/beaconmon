import { ErrorCode } from '@beaconmon/types';
import type { ZodIssue } from 'zod';

export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly extra?: Record<string, unknown>;

  constructor(statusCode: number, code: string, message: string, extra?: Record<string, unknown>) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.extra = extra;
  }

  toResponse(): Response {
    return Response.json(
      { error: this.message, code: this.code, ...this.extra },
      { status: this.statusCode }
    );
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(401, ErrorCode.UNAUTHORIZED, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(403, ErrorCode.FORBIDDEN, message);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not found') {
    super(404, ErrorCode.RESOURCE_NOT_FOUND, message);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, issues?: ZodIssue[]) {
    super(400, ErrorCode.VALIDATION_ERROR, message, issues ? { issues } : undefined);
  }
}

export class PlanLimitError extends AppError {
  constructor(message: string) {
    super(422, ErrorCode.PLAN_LIMIT_REACHED, message);
  }
}
