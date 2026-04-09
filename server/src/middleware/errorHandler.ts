import type { NextFunction, Request, Response } from "express";

export function notFound(_req: Request, res: Response) {
  return res.status(404).json({ message: "Route not found" });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (
    typeof err === "object" &&
    err !== null &&
    "type" in err &&
    (err as { type?: unknown }).type === "entity.too.large"
  ) {
    return res.status(413).json({ message: "Request is too large. Please upload an image up to 5MB only." });
  }

  const message = err instanceof Error ? err.message : "Unexpected error";
  return res.status(500).json({ message });
}

