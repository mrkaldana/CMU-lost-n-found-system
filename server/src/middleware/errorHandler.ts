import type { NextFunction, Request, Response } from "express";

export function notFound(_req: Request, res: Response) {
  return res.status(404).json({ message: "Route not found" });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const message = err instanceof Error ? err.message : "Unexpected error";
  return res.status(500).json({ message });
}

