import { NextFunction, Request, Response } from "express";

// Placeholder — wire in Supabase Auth JWT verification when auth is built.
// Applied to routes that will require login (e.g. POST /api/analysts).
export function requireAuth(
  _req: Request,
  _res: Response,
  next: NextFunction,
): void {
  // TODO: validate `Authorization: Bearer <token>` with Supabase Auth
  next();
}
