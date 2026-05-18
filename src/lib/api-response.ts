import { NextResponse } from "next/server";

export function apiError(message: string, status = 500, code?: string) {
  return NextResponse.json(
    { error: message, code },
    { status }
  );
}

export function getErrorMessage(error: unknown, fallback = "服务器错误，请稍后重试") {
  return error instanceof Error ? error.message : fallback;
}
