export const PLAN_LIMITS = {
  FREE: {
    max_analysts: 3,
    hot_slots: 1,
    daily_stock_fit: 5,
    pinning: 0,
  },
  PRO: {
    max_analysts: 10,
    hot_slots: 3,
    daily_stock_fit: 50,
    pinning: 2,
  },
  PREMIUM: {
    max_analysts: 50,
    hot_slots: 10,
    daily_stock_fit: 999999,
    pinning: 10,
  },
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;
