export function logAppError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  console.error("[Meanwhile Error Caught]", error, context);
}
