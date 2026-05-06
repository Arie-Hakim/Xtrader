import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { parseUnprocessedTweets } from "../services/parserService";
import { AppError } from "../types";

const router = Router();

router.post(
  "/:analystId",
  asyncHandler(async (req, res) => {
    const { analystId } = req.params;
    if (!analystId) throw new AppError("analystId נדרש", 400, "VALIDATION");

    const result = await parseUnprocessedTweets(analystId);
    res.json(result);
  }),
);

export default router;
