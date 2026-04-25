import { z } from "zod";

export const tickerQuerySchema = z.object({
  ticker: z
    .string()
    .min(1, "טיקר לא יכול להיות ריק")
    .max(10, "טיקר ארוך מדי")
    .transform((v) => v.toUpperCase()),
});

export type TickerQuery = z.infer<typeof tickerQuerySchema>;
