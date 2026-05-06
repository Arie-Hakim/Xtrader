import { Router } from "express";
import { supabase } from "../config/supabase";
import { asyncHandler } from "../middleware/asyncHandler";
import { logger } from "../middleware/logger";
import { requireAuth } from "../middleware/requireAuth";
import {
  getCachedStockFit,
  getCacheTTL,
  setCachedStockFit,
} from "../services/cacheManager";
import { callClaude, extractJson, loadSkillPrompt } from "../services/claudeClient";
import { canPerformStockFit } from "../services/planEnforcement";
import { AppError } from "../types";
import { StockFitResponseSchema } from "../validation/claudeResponses";
import { stockFitSchema } from "../validation/stockFit";

const router = Router();

const DISCLAIMER = "\n\n⚠️ מידע בלבד. אין זה ייעוץ פיננסי.";

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

    // Load latest DNA
    const { data: dna, error: dnaErr } = await supabase
      .from("analyst_dna")
      .select("*")
      .eq("analyst_id", analyst_id)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (dnaErr) throw new AppError(dnaErr.message, 500, "DB_ERROR");
    if (!dna) {
      throw new AppError(
        "טרם נבנה פרופיל DNA לאנליסט זה — יש להריץ את בנאי ה-DNA תחילה",
        422,
        "MISSING_DNA",
      );
    }

    // Load analyst info
    const { data: analyst } = await supabase
      .from("analysts")
      .select("username")
      .eq("id", analyst_id)
      .single();

    // Load recent insights for this ticker
    const { data: recentInsights } = await supabase
      .from("insights")
      .select("*")
      .eq("analyst_id", analyst_id)
      .eq("ticker", ticker)
      .order("created_at", { ascending: false })
      .limit(5);

    const prompt = loadSkillPrompt("stock-fit-analyzer");
    const userMsg = JSON.stringify({
      analyst_id,
      analyst_username: analyst?.username ?? analyst_id,
      dna: dna.profile_data,
      ticker,
      current_regime: "BULL_STRONG",
      recent_insights: recentInsights ?? [],
    });

    logger.info({ analystId: analyst_id, ticker }, "running stock-fit analysis");
    const raw = await callClaude(prompt, userMsg);
    const fitParsed = StockFitResponseSchema.safeParse(extractJson(raw));

    if (!fitParsed.success) {
      logger.error({ analystId: analyst_id, ticker, issues: fitParsed.error.issues }, "invalid stock-fit response");
      throw new AppError("Claude החזיר תוצאת stock-fit לא תקינה", 500, "CLAUDE_INVALID");
    }

    const result = {
      ...fitParsed.data,
      fit_score: Math.round(fitParsed.data.fit_score),
      explanation_he: fitParsed.data.explanation_he + DISCLAIMER,
    };

    // Save to DB with 4h TTL
    const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString();
    await supabase.from("stock_fit_results").upsert({
      analyst_id,
      ticker,
      fit_score: result.fit_score,
      explanation_he: result.explanation_he,
      risks_he: result.risks.map((r) => r.risk_he),
      relevant_tweet_url: result.relevant_tweet?.tweet_url ?? null,
      current_regime: result.regime_aligned ? "BULL_STRONG" : null,
      expires_at: expiresAt,
    });

    setCachedStockFit(analyst_id, ticker, result, getCacheTTL("FREE", false));
    logger.info({ analystId: analyst_id, ticker, fitScore: result.fit_score }, "stock-fit complete");

    return res.status(200).json({
      result,
      cache_hit: false,
      plan_remaining: enforcement.remaining,
    });
  }),
);

export default router;
