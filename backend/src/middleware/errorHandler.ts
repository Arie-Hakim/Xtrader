import { ErrorRequestHandler } from "express";
import { logger } from "./logger";
import { AppError } from "../types";

const HEBREW_MESSAGES: Record<string, string> = {
  NOT_FOUND: "הרשומה לא נמצאה",
  UNAUTHORIZED: "אין הרשאה",
  FORBIDDEN: "הגישה נדחתה",
  CONFLICT: "הנתון כבר קיים במערכת",
  DB_ERROR: "שגיאת מסד נתונים",
  VALIDATION: "שגיאת קלט",
  DEFAULT: "אירעה שגיאה פנימית",
};

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const isDev = process.env.NODE_ENV !== "production";

  const status = err instanceof AppError ? err.status : 500;
  const code = err instanceof AppError ? err.code : "DEFAULT";

  logger.error({ err, path: req.path, method: req.method }, "Request error");

  res.status(status).json({
    error: HEBREW_MESSAGES[code] ?? HEBREW_MESSAGES.DEFAULT,
    ...(isDev && { details: err.message, stack: err.stack }),
  });
};
