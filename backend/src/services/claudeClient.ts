import fs from "fs";
import path from "path";
import Anthropic from "@anthropic-ai/sdk";
import { logger } from "../middleware/logger";
import { AppError } from "../types";

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) throw new Error("ANTHROPIC_API_KEY is required");

const model: string = process.env.ANTHROPIC_MODEL ?? (() => { throw new Error("ANTHROPIC_MODEL is required"); })();

const client = new Anthropic({ apiKey, maxRetries: 3 });

const skillCache = new Map<string, string>();

const SKILL_DIR = path.resolve(__dirname, "../../../skills");

export function loadSkillPrompt(skillName: string): string {
  if (skillCache.has(skillName)) return skillCache.get(skillName)!;

  const filePath = path.join(SKILL_DIR, skillName, "SKILL.md");
  if (!fs.existsSync(filePath)) {
    throw new Error(`skill prompt not found: ${skillName} (${filePath})`);
  }

  const content = fs.readFileSync(filePath, "utf-8");
  skillCache.set(skillName, content);
  return content;
}

function extractJson(text: string): unknown {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (match) return JSON.parse(match[1].trim());
  return JSON.parse(text.trim());
}

export async function callClaude(
  systemPrompt: string,
  userMessage: string,
): Promise<string> {
  const response = await client.messages.create({
    model,
    max_tokens: 4096,
    system: [
      {
        type: "text",
        text: systemPrompt,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: userMessage }],
  });

  const usage = response.usage as {
    input_tokens: number;
    output_tokens: number;
    cache_read_input_tokens?: number;
    cache_creation_input_tokens?: number;
  };
  logger.info(
    {
      model,
      inputTokens: usage.input_tokens,
      outputTokens: usage.output_tokens,
      cacheReadTokens: usage.cache_read_input_tokens ?? 0,
      cacheCreationTokens: usage.cache_creation_input_tokens ?? 0,
    },
    "claude api call",
  );

  const block = response.content[0];
  if (!block || block.type !== "text") {
    throw new AppError("שגיאה בתגובת Claude — תגובה לא צפויה", 500, "CLAUDE_ERROR");
  }

  return block.text;
}

export { extractJson };
