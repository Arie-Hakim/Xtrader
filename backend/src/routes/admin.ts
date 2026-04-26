import { Router } from "express";
import { supabase } from "../config/supabase";
import { asyncHandler } from "../middleware/asyncHandler";
import { requireAuth } from "../middleware/requireAuth";
import { rebalanceTiers } from "../services/adaptiveFetch";
import { AppError } from "../types";

const router = Router();

router.get(
  "/cost-stats",
  requireAuth,
  asyncHandler(async (_req, res) => {
    const { data, error } = await supabase
      .from("usage_tracking")
      .select("action, count")
      .order("action");

    if (error) throw new AppError(error.message, 500, "DB_ERROR");

    const grouped: Record<string, number> = {};
    for (const row of data ?? []) {
      const action = (row as { action: string; count: number }).action;
      const count = (row as { action: string; count: number }).count;
      grouped[action] = (grouped[action] ?? 0) + count;
    }

    res.json({ cost_stats: grouped });
  }),
);

router.get(
  "/tier-distribution",
  requireAuth,
  asyncHandler(async (_req, res) => {
    const { data, error } = await supabase
      .from("analysts")
      .select("fetch_tier")
      .eq("is_active", true);

    if (error) throw new AppError(error.message, 500, "DB_ERROR");

    const dist: Record<string, number> = { HOT: 0, WARM: 0, COLD: 0 };
    for (const row of data ?? []) {
      const tier = (row as { fetch_tier: string }).fetch_tier ?? "HOT";
      dist[tier] = (dist[tier] ?? 0) + 1;
    }

    res.json({ distribution: dist, total: (data ?? []).length });
  }),
);

router.post(
  "/rebalance-tiers",
  requireAuth,
  asyncHandler(async (_req, res) => {
    const result = await rebalanceTiers();
    res.json(result);
  }),
);

export default router;
