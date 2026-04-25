import { Router } from "express";
import { toInsightResponse } from "../dto/insightDto";
import { asyncHandler } from "../middleware/asyncHandler";
import { getInsightsByTicker } from "../services/supabaseService";
import { AppError } from "../types";
import { tickerQuerySchema } from "../validation/insights";

const router = Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const parsed = tickerQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      throw new AppError("פרמטר ticker חסר או לא תקין", 400, "VALIDATION");
    }

    const rows = await getInsightsByTicker(parsed.data.ticker);
    res.json(rows.map(toInsightResponse));
  }),
);

export default router;
