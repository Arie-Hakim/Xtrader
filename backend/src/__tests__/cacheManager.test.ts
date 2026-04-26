import {
  getCacheTTL,
  getCachedStockFit,
  setCachedStockFit,
} from "../services/cacheManager";

const ANALYST_ID = "analyst-001";
const TICKER = "NVDA";

describe("getCacheTTL", () => {
  it("FREE plan always returns 4h regardless of market hours", () => {
    expect(getCacheTTL("FREE", false)).toBe(14400);
  });

  it("FREE plan with pinned returns 2h", () => {
    expect(getCacheTTL("FREE", true)).toBe(7200);
  });

  it("PRO plan pinned returns half the base TTL", () => {
    const base = getCacheTTL("PRO", false);
    expect(getCacheTTL("PRO", true)).toBe(Math.floor(base / 2));
  });

  it("PREMIUM plan pinned returns half the base TTL", () => {
    const base = getCacheTTL("PREMIUM", false);
    expect(getCacheTTL("PREMIUM", true)).toBe(Math.floor(base / 2));
  });

  it("PRO non-pinned TTL is <= 4h", () => {
    expect(getCacheTTL("PRO", false)).toBeLessThanOrEqual(14400);
  });

  it("PREMIUM non-pinned TTL is <= PRO non-pinned TTL", () => {
    expect(getCacheTTL("PREMIUM", false)).toBeLessThanOrEqual(
      getCacheTTL("PRO", false),
    );
  });
});

describe("getCachedStockFit / setCachedStockFit", () => {
  it("returns null for a cache miss", () => {
    expect(getCachedStockFit("unknown-id", "AAPL")).toBeNull();
  });

  it("returns the stored value immediately after set", () => {
    const payload = { status: "pending", message: "test" };
    setCachedStockFit(ANALYST_ID, TICKER, payload, 300);
    expect(getCachedStockFit(ANALYST_ID, TICKER)).toEqual(payload);
  });

  it("ticker lookup is case-insensitive", () => {
    const payload = { status: "pending", message: "case test" };
    setCachedStockFit(ANALYST_ID, "tsla", payload, 300);
    expect(getCachedStockFit(ANALYST_ID, "TSLA")).toEqual(payload);
    expect(getCachedStockFit(ANALYST_ID, "tsla")).toEqual(payload);
  });

  it("returns null after TTL expires", () => {
    jest.useFakeTimers();
    const payload = { status: "pending" };
    setCachedStockFit(ANALYST_ID, "MSFT", payload, 60);

    jest.advanceTimersByTime(61_000);
    expect(getCachedStockFit(ANALYST_ID, "MSFT")).toBeNull();

    jest.useRealTimers();
  });
});
