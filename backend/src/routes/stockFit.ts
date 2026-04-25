import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { requireAuth } from "../middleware/requireAuth";
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

    const result = await getStockFitPlaceholder(
      parsed.data.analyst_id,
      parsed.data.ticker,
    );
    res.status(202).json(result);
  }),
);

export default router;
