import "express";

declare global {
  namespace Express {
    interface UserPayload {
      id: string;
      role: "admin" | "user";
      name: string;
      email: string;
    }

    interface Request {
      user?: UserPayload;
    }
  }
}

export {};

