/**
 * Unified API error response utilities for the forum.
 *
 * Ensures consistent error shape across all forum API routes:
 *   { error: string, code: string, requestId: string, details?: any }
 *
 * Database errors are NEVER masked as 404.
 */

import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

// ─── Error Codes ───

export const ErrorCode = {
  // Client errors (4xx)
  BAD_REQUEST: "BAD_REQUEST",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  RATE_LIMITED: "RATE_LIMITED",
  VALIDATION_ERROR: "VALIDATION_ERROR",

  // Server errors (5xx)
  INTERNAL_ERROR: "INTERNAL_ERROR",
  DATABASE_ERROR: "DATABASE_ERROR",
  TIMEOUT: "TIMEOUT",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
} as const;

export type ErrorCodeType = typeof ErrorCode[keyof typeof ErrorCode];

// ─── Error Response Shape ───

export interface ApiErrorResponse {
  error: string;
  code: string;
  requestId: string;
  details?: unknown;
}

// ─── Request ID ───

/**
 * Generate a unique request ID for tracing.
 * Uses crypto.randomUUID for uniqueness.
 */
export function generateRequestId(): string {
  return `req_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
}

/**
 * Extract request ID from headers or generate a new one.
 */
export function getRequestId(req: Request): string {
  return (
    req.headers.get("x-request-id") ||
    req.headers.get("x-correlation-id") ||
    generateRequestId()
  );
}

// ─── Error Helpers ───

/**
 * Create a standard 400 Bad Request response.
 */
export function badRequest(message: string, requestId?: string, details?: unknown) {
  return NextResponse.json(
    {
      error: message,
      code: ErrorCode.BAD_REQUEST,
      requestId: requestId || generateRequestId(),
      details,
    },
    { status: 400, headers: { "x-request-id": requestId || "" } }
  );
}

/**
 * Create a standard 401 Unauthorized response.
 */
export function unauthorized(message = "请先登录", requestId?: string) {
  return NextResponse.json(
    {
      error: message,
      code: ErrorCode.UNAUTHORIZED,
      requestId: requestId || generateRequestId(),
    },
    { status: 401, headers: { "x-request-id": requestId || "" } }
  );
}

/**
 * Create a standard 403 Forbidden response.
 */
export function forbidden(message = "权限不足", requestId?: string, details?: unknown) {
  return NextResponse.json(
    {
      error: message,
      code: ErrorCode.FORBIDDEN,
      requestId: requestId || generateRequestId(),
      details,
    },
    { status: 403, headers: { "x-request-id": requestId || "" } }
  );
}

/**
 * Create a standard 404 Not Found response.
 * IMPORTANT: Only use when the resource genuinely doesn't exist.
 * Database errors must NOT be masked as 404.
 */
export function notFound(message = "内容不存在", requestId?: string) {
  return NextResponse.json(
    {
      error: message,
      code: ErrorCode.NOT_FOUND,
      requestId: requestId || generateRequestId(),
    },
    { status: 404, headers: { "x-request-id": requestId || "" } }
  );
}

/**
 * Create a standard 409 Conflict response.
 * Used for duplicate actions (e.g., already liked, already reported).
 */
export function conflict(message: string, requestId?: string) {
  return NextResponse.json(
    {
      error: message,
      code: ErrorCode.CONFLICT,
      requestId: requestId || generateRequestId(),
    },
    { status: 409, headers: { "x-request-id": requestId || "" } }
  );
}

/**
 * Create a standard 429 Rate Limited response.
 */
export function rateLimited(message = "操作过于频繁，请稍后再试", requestId?: string) {
  return NextResponse.json(
    {
      error: message,
      code: ErrorCode.RATE_LIMITED,
      requestId: requestId || generateRequestId(),
    },
    { status: 429, headers: { "x-request-id": requestId || "" } }
  );
}

/**
 * Create a standard 500 Internal Error response.
 * Database errors are reported as DATABASE_ERROR, not masked as 404.
 */
export function internalError(
  message = "服务器内部错误",
  requestId?: string,
  isDbError = false
) {
  return NextResponse.json(
    {
      error: message,
      code: isDbError ? ErrorCode.DATABASE_ERROR : ErrorCode.INTERNAL_ERROR,
      requestId: requestId || generateRequestId(),
    },
    { status: 500, headers: { "x-request-id": requestId || "" } }
  );
}

// ─── Log Redaction ───

/**
 * Redact sensitive data from error logs.
 * Removes: passwords, tokens, emails (partial), connection strings.
 */
export function redactForLog(value: unknown): string {
  if (typeof value === "string") {
    return value
      // Redact connection strings
      .replace(/postgresql:\/\/[^@]+@[^"]+/g, "postgresql://***:***@***")
      .replace(/DATABASE_URL=\S+/g, "DATABASE_URL=***REDACTED***")
      // Redact tokens
      .replace(/token["\s:=]+[a-zA-Z0-9\-_.]+/gi, "token=***REDACTED***")
      .replace(/secret["\s:=]+\S+/gi, "secret=***REDACTED***")
      // Redact passwords
      .replace(/password["\s:=]+\S+/gi, "password=***REDACTED***")
      // Redact email addresses (partial)
      .replace(/([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, "$1***@$2");
  }
  try {
    return JSON.stringify(value, null, 2)
      .replace(/postgresql:\/\/[^@]+@[^"]+/g, "postgresql://***:***@***")
      .replace(/DATABASE_URL=\S+/g, "DATABASE_URL=***REDACTED***")
      .replace(/token["\s:=]+[a-zA-Z0-9\-_.]+/gi, "token=***REDACTED***")
      .replace(/secret["\s:=]+\S+/gi, "secret=***REDACTED***")
      .replace(/password["\s:=]+\S+/gi, "password=***REDACTED***")
      .replace(/([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, "$1***@$2");
  } catch {
    return String(value);
  }
}

/**
 * Safe error handler for API routes.
 * Catches all errors, logs redacted info, returns appropriate response.
 * NEVER masks database errors as 404.
 */
export function handleApiError(error: unknown, requestId?: string): NextResponse {
  const reqId = requestId || generateRequestId();

  // Prisma errors
  if (error && typeof error === "object" && "code" in error) {
    const prismaError = error as { code: string; message: string };
    console.error(`[Forum API Error] requestId=${reqId} prismaCode=${prismaError.code} message=${redactForLog(prismaError.message)}`);

    // Record not found
    if (prismaError.code === "P2025") {
      return notFound("内容不存在", reqId);
    }

    // Unique constraint violation
    if (prismaError.code === "P2002") {
      return conflict("操作冲突，请勿重复提交", reqId);
    }

    // Other database errors - reported as DATABASE_ERROR, NOT 404
    return internalError("数据库操作失败，请稍后重试", reqId, true);
  }

  // Timeout errors
  if (error instanceof Error && error.message.includes("timed out")) {
    console.error(`[Forum API Error] requestId=${reqId} timeout message=${redactForLog(error.message)}`);
    return NextResponse.json(
      {
        error: "请求超时，请稍后重试",
        code: ErrorCode.TIMEOUT,
        requestId: reqId,
      },
      { status: 504, headers: { "x-request-id": reqId } }
    );
  }

  // Generic errors
  const message = error instanceof Error ? error.message : "未知错误";
  console.error(`[Forum API Error] requestId=${reqId} message=${redactForLog(message)}`);
  return internalError("服务器内部错误", reqId);
}
