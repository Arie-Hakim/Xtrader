import {
  canAddAnalyst,
  canPinAnalyst,
  canPerformStockFit,
  getCurrentUsage,
} from "../services/planEnforcement";

const USER_ID = "user-skeleton-test";

describe("planEnforcement skeleton", () => {
  it("canAddAnalyst always returns allowed=true", async () => {
    const result = await canAddAnalyst(USER_ID);
    expect(result.allowed).toBe(true);
  });

  it("canPerformStockFit always returns allowed=true with remaining count", async () => {
    const result = await canPerformStockFit(USER_ID);
    expect(result.allowed).toBe(true);
    expect(typeof result.remaining).toBe("number");
    expect(result.remaining).toBeGreaterThan(0);
  });

  it("canPinAnalyst always returns allowed=true", async () => {
    const result = await canPinAnalyst(USER_ID);
    expect(result.allowed).toBe(true);
  });

  it("getCurrentUsage returns zeroed stats", async () => {
    const stats = await getCurrentUsage(USER_ID);
    expect(stats).toEqual({
      stock_fit_count: 0,
      analysts_count: 0,
      pinned_count: 0,
    });
  });
});
