import { z } from "zod";

const ANALYST_TYPES = [
  "trader-scalp",
  "trader-swing",
  "trader-position",
  "investor-value",
  "investor-growth",
  "macro",
  "mixed",
] as const;

export const createAnalystSchema = z.object({
  username: z
    .string()
    .min(1)
    .max(50)
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "שם משתמש יכול להכיל רק אותיות, ספרות וקווים תחתונים",
    ),
  display_name: z.string().min(1).max(100),
  analyst_type: z.enum(ANALYST_TYPES),
});

export type CreateAnalystInput = z.infer<typeof createAnalystSchema>;
