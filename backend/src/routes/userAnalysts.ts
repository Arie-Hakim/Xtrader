import { Router } from "express";
import { z } from "zod";
import { supabase } from "../config/supabase";
import { asyncHandler } from "../middleware/asyncHandler";
import { requireAuth } from "../middleware/requireAuth";
import { canAddAnalyst, canPinAnalyst } from "../services/planEnforcement";
import { AppError } from "../types";

const router = Router();

const addAnalystSchema = z.object({
  analyst_id: z.string().uuid("מזהה אנליסט לא תקין"),
});

function getUserId(
  req: Parameters<typeof asyncHandler>[0] extends (
    req: infer R,
    ...args: unknown[]
  ) => unknown
    ? R
    : never,
): string {
  return (req as { user?: { id?: string } }).user?.id ?? "anonymous";
}

router.post(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const parsed = addAnalystSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError("מזהה אנליסט חסר או לא תקין", 400, "VALIDATION");
    }

    const userId = (req as { user?: { id?: string } }).user?.id ?? "anonymous";
    const { analyst_id } = parsed.data;

    const enforcement = await canAddAnalyst(userId);
    if (!enforcement.allowed) {
      throw new AppError(
        enforcement.reason ?? "לא ניתן להוסיף אנליסטים נוספים בתוכנית הנוכחית",
        403,
        "PLAN_LIMIT",
      );
    }

    const { data: analyst } = await supabase
      .from("analysts")
      .select("id")
      .eq("id", analyst_id)
      .eq("is_active", true)
      .maybeSingle();

    if (!analyst) {
      throw new AppError(`אנליסט לא נמצא: ${analyst_id}`, 404, "NOT_FOUND");
    }

    const { data, error } = await supabase
      .from("user_analysts")
      .insert({ user_id: userId, analyst_id })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        throw new AppError("האנליסט כבר נמצא ברשימה שלך", 409, "CONFLICT");
      }
      throw new AppError(error.message, 500, "DB_ERROR");
    }

    res.status(201).json(data);
  }),
);

router.delete(
  "/:analyst_id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = (req as { user?: { id?: string } }).user?.id ?? "anonymous";
    const { analyst_id } = req.params;

    const { error } = await supabase
      .from("user_analysts")
      .delete()
      .eq("user_id", userId)
      .eq("analyst_id", analyst_id);

    if (error) {
      throw new AppError(error.message, 500, "DB_ERROR");
    }

    res.status(204).send();
  }),
);

router.post(
  "/:analyst_id/pin",
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = (req as { user?: { id?: string } }).user?.id ?? "anonymous";
    const { analyst_id } = req.params;

    const { data: existing, error: fetchError } = await supabase
      .from("user_analysts")
      .select("id, is_pinned")
      .eq("user_id", userId)
      .eq("analyst_id", analyst_id)
      .maybeSingle();

    if (fetchError) throw new AppError(fetchError.message, 500, "DB_ERROR");
    if (!existing) {
      throw new AppError("האנליסט לא נמצא ברשימה שלך", 404, "NOT_FOUND");
    }

    const newPinned = !(existing as { is_pinned: boolean }).is_pinned;

    if (newPinned) {
      const enforcement = await canPinAnalyst(userId);
      if (!enforcement.allowed) {
        throw new AppError(
          enforcement.reason ?? "לא ניתן לנעוץ אנליסטים נוספים בתוכנית הנוכחית",
          403,
          "PLAN_LIMIT",
        );
      }
    }

    const { data, error } = await supabase
      .from("user_analysts")
      .update({ is_pinned: newPinned })
      .eq("id", (existing as { id: string }).id)
      .select()
      .single();

    if (error) throw new AppError(error.message, 500, "DB_ERROR");

    res.json(data);
  }),
);

router.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = (req as { user?: { id?: string } }).user?.id ?? "anonymous";

    const { data, error } = await supabase
      .from("user_analysts")
      .select("*, analysts(*)")
      .eq("user_id", userId)
      .order("last_view_at", { ascending: false });

    if (error) throw new AppError(error.message, 500, "DB_ERROR");

    res.json(data ?? []);
  }),
);

router.post(
  "/:analyst_id/view",
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = (req as { user?: { id?: string } }).user?.id ?? "anonymous";
    const { analyst_id } = req.params;

    const { error } = await supabase
      .from("user_analysts")
      .update({ last_view_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("analyst_id", analyst_id);

    if (error) throw new AppError(error.message, 500, "DB_ERROR");

    res.status(200).json({ ok: true });
  }),
);

export default router;
