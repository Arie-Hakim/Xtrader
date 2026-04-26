// TODO: replace in-memory Map with Redis (ioredis) once Redis is provisioned
import { PlanType } from "../config/plans";

interface CacheEntry {
  result: unknown;
  expires_at: number;
}

const cache = new Map<string, CacheEntry>();

function key(analyst_id: string, ticker: string): string {
  return `${analyst_id}:${ticker.toUpperCase()}`;
}

export function isMarketHours(): boolean {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(new Date());

  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "";
  const hour = parseInt(parts.find((p) => p.type === "hour")?.value ?? "0", 10);
  const minute = parseInt(
    parts.find((p) => p.type === "minute")?.value ?? "0",
    10,
  );

  if (["Sat", "Sun"].includes(weekday)) return false;

  const minutes = hour * 60 + minute;
  return minutes >= 570 && minutes < 960; // 9:30–16:00 ET
}

export function getCacheTTL(plan_type: PlanType, is_pinned: boolean): number {
  const inMarket = isMarketHours();
  let ttl: number;

  if (plan_type === "PREMIUM") {
    ttl = inMarket ? 3600 : 14400;
  } else if (plan_type === "PRO") {
    ttl = inMarket ? 7200 : 14400;
  } else {
    ttl = 14400; // FREE: 4h regardless of market hours
  }

  return is_pinned ? Math.floor(ttl / 2) : ttl;
}

export function getCachedStockFit(
  analyst_id: string,
  ticker: string,
): unknown | null {
  const entry = cache.get(key(analyst_id, ticker));
  if (!entry) return null;
  if (Date.now() > entry.expires_at) {
    cache.delete(key(analyst_id, ticker));
    return null;
  }
  return entry.result;
}

export function setCachedStockFit(
  analyst_id: string,
  ticker: string,
  result: unknown,
  ttl_seconds: number,
): void {
  cache.set(key(analyst_id, ticker), {
    result,
    expires_at: Date.now() + ttl_seconds * 1000,
  });
}
