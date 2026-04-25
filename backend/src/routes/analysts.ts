import { Router } from "express";
import { toAnalystDnaResponse, toAnalystResponse } from "../dto/analystDto";
import { asyncHandler } from "../middleware/asyncHandler";
import { requireAuth } from "../middleware/requireAuth";
import {
  createAnalyst,
  getAllAnalysts,
  getAnalystByUsername,
} from "../services/supabaseService";
import { AppError } from "../types";
import { createAnalystSchema } from "../validation/analysts";

const router = Router();

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const rows = await getAllAnalysts();
    res.json(rows.map(toAnalystResponse));
  }),
);

router.get(
  "/:username",
  asyncHandler(async (req, res) => {
    const { username } = req.params;
    const result = await getAnalystByUsername(username);

    if (!result) {
      throw new AppError(`analyst not found: ${username}`, 404, "NOT_FOUND");
    }

    res.json({
      analyst: toAnalystResponse(result.analyst),
      dna: result.dna ? toAnalystDnaResponse(result.dna) : null,
    });
  }),
);

router.post(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const parsed = createAnalystSchema.safeParse(req.body);

    if (!parsed.success) {
      const field = parsed.error.issues[0]?.path.join(".") ?? "שדה לא ידוע";
      throw new AppError(`validation failed: ${field}`, 400, "VALIDATION");
    }

    const row = await createAnalyst(parsed.data);
    res.status(201).json(toAnalystResponse(row));
  }),
);

export default router;
