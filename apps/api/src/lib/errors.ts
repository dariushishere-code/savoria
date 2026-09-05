export class AppError extends Error {
  constructor(public statusCode: number, message: string, public code?: string, public errors?: Record<string,string[]>) {
    super(message); this.name = "AppError";
  }
}
export class UnauthorizedError extends AppError { constructor(m="Unauthorized"){ super(401,m,"UNAUTHORIZED"); } }
export class ForbiddenError extends AppError { constructor(m="Forbidden"){ super(403,m,"FORBIDDEN"); } }
export class NotFoundError extends AppError { constructor(m="Not found"){ super(404,m,"NOT_FOUND"); } }
export class ConflictError extends AppError { constructor(m="Conflict"){ super(409,m,"CONFLICT"); } }
export class ValidationError extends AppError { constructor(m="Validation failed", e?: Record<string,string[]>){ super(400,m,"VALIDATION_ERROR",e); } }
export class BadRequestError extends AppError { constructor(m="Bad request"){ super(400,m,"BAD_REQUEST"); } }
