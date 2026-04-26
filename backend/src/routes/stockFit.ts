import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { requireAuth } from "../middleware/requireAuth";
import {
  getCachedStockFit,
  getCacheTTL,
  setCachedStockFit,
} from "../services/cacheManager";
import { canPerformStockFit } from "../services/planEnforcement";
import { getStockFitPlaceholder } from "../services/supabaseService";
import { AppError } from "../types";
import { stockFitSchema } from "../validation/stockFit";

const router = Router();

router.post(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const parsed = stockFitSchema.safeParse(req.body);

    if (!parsed.success) {
      const field = parsed.error.issues[0]?.path.join(".") ?? "שדה לא ידוע";
      throw new AppError(`validation failed: ${field}`, 400, "VALIDATION");
    }

    const userId = (req as { user?: { id?: string } }).user?.id ?? "anonymous";
    const { analyst_id, ticker } = parsed.data;

    const enforcement = await canPerformStockFit(userId);
    if (!enforcement.allowed) {
      throw new AppError(
        enforcement.reason ?? "הגעת למגבלת בדיקות המניה היומית",
        403,
        "PLAN_LIMIT",
      );
    }

    const cached = getCachedStockFit(analyst_id, ticker);
    if (cached) {
      return res.status(200).json({
        result: cached,
        cache_hit: true,
        plan_remaining: enforcement.remaining,
      });
    }

    const result = await getStockFitPlaceholder(analyst_id, ticker);
    setCachedStockFit(analyst_id, ticker, result, getCacheTTL("FREE", false));

    return res.status(202).json({
      result,
      cache_hit: false,
      plan_remaining: enforcement.remaining,
    });
  }),
);

export default router;
