import { Router } from "express";
import { supabase } from "../config/supabase";
import { asyncHandler } from "../middleware/asyncHandler";

const router = Router();

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const { error } = await supabase.from("analysts").select("id").limit(1);

    if (error) {
      res.status(503).json({
        status: "error",
        database: "disconnected",
        detail: error.message,
      });
      return;
    }

    res.json({ status: "ok", database: "connected" });
  }),
);

export default router;
