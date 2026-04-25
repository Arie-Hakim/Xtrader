import { z } from "zod";

export const stockFitSchema = z.object({
  analyst_id: z.string().uuid("analyst_id חייב להיות UUID תקין"),
  ticker: z
    .string()
    .min(1, "טיקר לא יכול להיות ריק")
    .max(10, "טיקר ארוך מדי")
    .transform((v) => v.toUpperCase()),
});

export type StockFitInput = z.infer<typeof stockFitSchema>;
