import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../middleware/asyncHandler";
import { logger } from "../middleware/logger";
import { runFetchForAnalyst } from "../services/fetcherService";
import { buildDNA } from "../services/dnaBuilderService";
import { parseUnprocessedTweets } from "../services/parserService";
import {
  createAnalyst,
  getAnalystByUsername,
} from "../services/supabaseService";
import { AppError } from "../types";

const router = Router();

const demoSchema = z.object({
  username: z.string().min(1),
  ticker: z.string().min(1),
  force: z.boolean().optional().default(false),
});

router.post(
  "/run-full-pipeline",
  asyncHandler(async (req, res) => {
    if (process.env.NODE_ENV === "production") {
      throw new AppError(
        "נתיב זה אינו זמין בסביבת ייצור",
        403,
        "PROD_DISABLED",
      );
    }

    const parsed = demoSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError("username ו-ticker נדרשים", 400, "VALIDATION");
    }

    const { username, ticker, force } = parsed.data;
    logger.info({ username, ticker, force }, "demo pipeline starting");

    // Step 1: resolve or create analyst
    let analystRecord = await getAnalystByUsername(username);
    if (!analystRecord) {
      const created = await createAnalyst({
        username,
        display_name: username,
        analyst_type: "mixed",
      });
      analystRecord = { analyst: created, dna: null };
    }
    const { analyst } = analystRecord;

    // Step 2: fetch tweets
    let tweetsFetched = 0;
    try {
      const fetchResult = await runFetchForAnalyst(analyst);
      tweetsFetched = fetchResult.saved;
    } catch (err) {
      logger.warn({ err, username }, "fetch step failed — continuing");
    }

    // Step 3: parse tweets → insights
    let insightsCreated = 0;
    let parseSkipped = 0;
    try {
      const parseResult = await parseUnprocessedTweets(analyst.id);
      insightsCreated = parseResult.insights;
      parseSkipped = parseResult.skipped;
    } catch (err) {
      logger.warn(
        { err, analystId: analyst.id },
        "parse step failed — continuing",
      );
    }

    // Step 4: build DNA (skip if insufficient insights)
    let dnaVersion: number | null = null;
    let dnaSkipped: string | null = null;
    try {
      const dnaResult = await buildDNA(analyst.id, {
        forceMin: force ? 20 : undefined,
      });
      dnaVersion = dnaResult.version;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      dnaSkipped = msg;
      logger.info({ analystId: analyst.id, reason: msg }, "dna step skipped");
    }

    logger.info(
      { username, tweetsFetched, insightsCreated, dnaVersion },
      "demo pipeline complete",
    );

    res.json({
      analyst_id: analyst.id,
      username,
      ticker,
      tweets_fetched: tweetsFetched,
      insights_created: insightsCreated,
      parse_skipped: parseSkipped,
      dna_version: dnaVersion,
      dna_skipped: dnaSkipped,
    });
  }),
);

export default router;
