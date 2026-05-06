import { supabase } from "../config/supabase";
import { logger } from "../middleware/logger";
import { AppError } from "../types";
import { DnaResponseSchema } from "../validation/claudeResponses";
import { callClaude, extractJson, loadSkillPrompt } from "./claudeClient";

export const MIN_INSIGHTS_FOR_DNA = 100;

export async function buildDNA(
  analystId: string,
  opts?: { forceMin?: number },
): Promise<{ version: number; profile: object }> {
  const { data: analyst, error: aErr } = await supabase
    .from("analysts")
    .select("id, username, analyst_type")
    .eq("id", analystId)
    .eq("is_active", true)
    .single();

  if (aErr || !analyst) {
    throw new AppError(`אנליסט לא נמצא: ${analystId}`, 404, "NOT_FOUND");
  }

  const { data: insights, error: iErr } = await supabase
    .from("insights")
    .select("*")
    .eq("analyst_id", analystId)
    .order("created_at", { ascending: false });

  if (iErr) throw new AppError(iErr.message, 500, "DB_ERROR");

  const minRequired = opts?.forceMin ?? MIN_INSIGHTS_FOR_DNA;
  const count = insights?.length ?? 0;

  if (count < minRequired) {
    throw new AppError(
      `צריך לפחות ${minRequired} insights לבניית DNA — יש כרגע ${count}`,
      422,
      "INSUFFICIENT_INSIGHTS",
    );
  }

  const sample = (insights ?? []).slice(0, 500);
  const prompt = loadSkillPrompt("dna-builder");
  const input = {
    analyst_id: analyst.id,
    analyst_username: analyst.username,
    analyst_type: analyst.analyst_type,
    insights: sample,
  };

  logger.info({ analystId, insightCount: count, sending: sample.length }, "building dna");
  const raw = await callClaude(prompt, JSON.stringify(input));
  const parsed = DnaResponseSchema.safeParse(extractJson(raw));

  if (!parsed.success) {
    logger.error({ analystId, issues: parsed.error.issues }, "invalid dna response");
    throw new AppError("Claude החזיר DNA לא תקין", 500, "CLAUDE_INVALID");
  }

  const { data: existing } = await supabase
    .from("analyst_dna")
    .select("version")
    .eq("analyst_id", analystId)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextVersion = (existing?.version ?? 0) + 1;
  const profile = { ...parsed.data, version: nextVersion, analyst_id: analyst.id };

  await supabase.from("analyst_dna").upsert({
    analyst_id: analyst.id,
    version: nextVersion,
    profile_type: analyst.analyst_type,
    profile_data: profile,
    tweets_analyzed_count: count,
  });

  await supabase
    .from("analysts")
    .update({ dna_version: nextVersion })
    .eq("id", analyst.id);

  logger.info({ analystId, version: nextVersion }, "dna built");
  return { version: nextVersion, profile };
}
