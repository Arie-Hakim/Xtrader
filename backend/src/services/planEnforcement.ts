// Skeleton — all checks return allowed:true.
// Wire in real DB queries + Stripe validation during the Monetization sprint.
import { PLAN_LIMITS } from "../config/plans";

export interface EnforcementResult {
  allowed: boolean;
  reason?: string;
}

export interface StockFitEnforcementResult {
  allowed: boolean;
  remaining: number;
  reason?: string;
}

export interface UsageStats {
  stock_fit_count: number;
  analysts_count: number;
  pinned_count: number;
}

export async function canAddAnalyst(
  _userId: string,
): Promise<EnforcementResult> {
  return { allowed: true };
}

export async function canPerformStockFit(
  _userId: string,
): Promise<StockFitEnforcementResult> {
  return { allowed: true, remaining: PLAN_LIMITS.FREE.daily_stock_fit };
}

export async function canPinAnalyst(
  _userId: string,
): Promise<EnforcementResult> {
  return { allowed: true };
}

export async function getCurrentUsage(_userId: string): Promise<UsageStats> {
  return { stock_fit_count: 0, analysts_count: 0, pinned_count: 0 };
}
