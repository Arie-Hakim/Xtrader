import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { runDailyFetch, runFetchForAnalyst } from "../services/fetcherService";
import { getAnalystByUsername } from "../services/supabaseService";
import { supabase } from "../config/supabase";
import { AppError } from "../types";

const router = Router();

// POST /api/fetch/run-daily — must be registered before /:username
router.post(
  "/run-daily",
  asyncHandler(async (_req, res) => {
    const result = await runDailyFetch();
    res.json(result);
  }),
);

// POST /api/fetch/:username — manual per-analyst fetch
router.post(
  "/:username",
  asyncHandler(async (req, res) => {
    if (!process.env.TWITTER_BEARER_TOKEN) {
      throw new AppError(
        "שירות הטוויטר אינו מוגדר — חסר TWITTER_BEARER_TOKEN",
        503,
        "MISSING_TOKEN",
      );
    }

    const { username } = req.params;
    const result = await getAnalystByUsername(username);

    if (!result) {
      throw new AppError(`אנליסט לא נמצא: ${username}`, 404, "NOT_FOUND");
    }

    const fetchResult = await runFetchForAnalyst(result.analyst);
    res.json(fetchResult);
  }),
);

// GET /api/fetch/status
router.get(
  "/status",
  asyncHandler(async (_req, res) => {
    const { data, error } = await supabase
      .from("analysts")
      .select("username, last_fetched_at, fetch_tier, last_tweet_id")
      .eq("is_active", true)
      .order("last_fetched_at", { ascending: false, nullsFirst: false });

    if (error) {
      throw new AppError(error.message, 500, "DB_ERROR");
    }

    res.json(data ?? []);
  }),
);

export default router;
