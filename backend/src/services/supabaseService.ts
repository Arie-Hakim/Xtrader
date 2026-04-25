import { supabase } from "../config/supabase";
import { logger } from "../middleware/logger";
import {
  AppError,
  DbAnalystDnaRow,
  DbAnalystRow,
  DbInsightRow,
  toDbEnum,
} from "../types";
import { CreateAnalystInput as CreateAnalystBody } from "../validation/analysts";

// ---------------------------------------------------------------------------
// Analysts
// ---------------------------------------------------------------------------

export async function getAllAnalysts(): Promise<DbAnalystRow[]> {
  const { data, error } = await supabase
    .from("analysts")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    logger.error({ error }, "getAllAnalysts failed");
    throw new AppError(error.message, 500, "DB_ERROR");
  }

  return (data ?? []) as DbAnalystRow[];
}

export async function getAnalystByUsername(
  username: string,
): Promise<{ analyst: DbAnalystRow; dna: DbAnalystDnaRow | null } | null> {
  const { data: analyst, error } = await supabase
    .from("analysts")
    .select("*")
    .eq("username", username)
    .eq("is_active", true)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // no rows
    logger.error({ error }, "getAnalystByUsername failed");
    throw new AppError(error.message, 500, "DB_ERROR");
  }

  const { data: dna, error: dnaError } = await supabase
    .from("analyst_dna")
    .select("*")
    .eq("analyst_id", analyst.id)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (dnaError) {
    logger.error({ dnaError }, "getAnalystByUsername DNA fetch failed");
    throw new AppError(dnaError.message, 500, "DB_ERROR");
  }

  return {
    analyst: analyst as DbAnalystRow,
    dna: dna as DbAnalystDnaRow | null,
  };
}

export async function createAnalyst(
  input: CreateAnalystBody,
): Promise<DbAnalystRow> {
  const { data: existing } = await supabase
    .from("analysts")
    .select("id")
    .eq("username", input.username)
    .maybeSingle();

  if (existing) {
    throw new AppError(
      `username already exists: ${input.username}`,
      409,
      "CONFLICT",
    );
  }

  const { data, error } = await supabase
    .from("analysts")
    .insert({
      username: input.username,
      display_name: input.display_name,
      analyst_type: toDbEnum(input.analyst_type),
      analyst_weight: 0.5,
      tweets_learned_count: 0,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    logger.error({ error }, "createAnalyst failed");
    throw new AppError(error.message, 500, "DB_ERROR");
  }

  return data as DbAnalystRow;
}

// ---------------------------------------------------------------------------
// Insights
// ---------------------------------------------------------------------------

export async function getInsightsByTicker(
  ticker: string,
): Promise<DbInsightRow[]> {
  const { data, error } = await supabase
    .from("insights")
    .select("*")
    .eq("ticker", ticker)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    logger.error({ error }, "getInsightsByTicker failed");
    throw new AppError(error.message, 500, "DB_ERROR");
  }

  return (data ?? []) as DbInsightRow[];
}

// ---------------------------------------------------------------------------
// Stock Fit — placeholder (AI agent not yet implemented)
// ---------------------------------------------------------------------------

export async function getStockFitPlaceholder(
  analystId: string,
  ticker: string,
): Promise<{
  analyst_id: string;
  ticker: string;
  status: string;
  message: string;
}> {
  // Verify analyst exists before returning placeholder
  const { data, error } = await supabase
    .from("analysts")
    .select("id")
    .eq("id", analystId)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    logger.error({ error }, "getStockFitPlaceholder analyst lookup failed");
    throw new AppError(error.message, 500, "DB_ERROR");
  }

  if (!data) {
    throw new AppError(`analyst not found: ${analystId}`, 404, "NOT_FOUND");
  }

  return {
    analyst_id: analystId,
    ticker,
    status: "pending",
    message: "בקשה התקבלה — ניתוח התאמת המניה יהיה זמין בקרוב",
  };
}
