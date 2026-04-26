// Prevent supabase.ts from throwing during import (these tests only cover pure functions)
jest.mock("../config/supabase", () => ({ supabase: {} }));

import { getFetchParams, shouldFetchAnalyst } from "../services/adaptiveFetch";
import { DbAnalystRow } from "../types";

function makeAnalyst(overrides: Partial<DbAnalystRow> = {}): DbAnalystRow {
  return {
    id: "test-id",
    username: "testanalyst",
    display_name: "Test Analyst",
    avatar_url: null,
    analyst_type: "trader_swing",
    analyst_weight: 0.5,
    tweets_learned_count: 0,
    is_active: true,
    created_at: new Date().toISOString(),
    last_tweet_id: null,
    last_fetched_at: null,
    tweets_per_day_avg: 0,
    fetch_tier: "HOT",
    dna_version: 1,
    dna_analyzed_until_tweet_id: null,
    ...overrides,
  };
}

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 3_600_000).toISOString();
}

describe("shouldFetchAnalyst", () => {
  it("returns true when last_fetched_at is null (never fetched)", () => {
    const analyst = makeAnalyst({ fetch_tier: "HOT", last_fetched_at: null });
    expect(shouldFetchAnalyst(analyst)).toBe(true);
  });

  describe("HOT tier (24h interval)", () => {
    it("returns false when fetched 12h ago", () => {
      const analyst = makeAnalyst({
        fetch_tier: "HOT",
        last_fetched_at: hoursAgo(12),
      });
      expect(shouldFetchAnalyst(analyst)).toBe(false);
    });

    it("returns true when fetched 25h ago", () => {
      const analyst = makeAnalyst({
        fetch_tier: "HOT",
        last_fetched_at: hoursAgo(25),
      });
      expect(shouldFetchAnalyst(analyst)).toBe(true);
    });
  });

  describe("WARM tier (7d interval)", () => {
    it("returns false when fetched 5 days ago", () => {
      const analyst = makeAnalyst({
        fetch_tier: "WARM",
        last_fetched_at: hoursAgo(5 * 24),
      });
      expect(shouldFetchAnalyst(analyst)).toBe(false);
    });

    it("returns true when fetched 8 days ago", () => {
      const analyst = makeAnalyst({
        fetch_tier: "WARM",
        last_fetched_at: hoursAgo(8 * 24),
      });
      expect(shouldFetchAnalyst(analyst)).toBe(true);
    });
  });

  describe("COLD tier (30d interval)", () => {
    it("returns false when fetched 15 days ago", () => {
      const analyst = makeAnalyst({
        fetch_tier: "COLD",
        last_fetched_at: hoursAgo(15 * 24),
      });
      expect(shouldFetchAnalyst(analyst)).toBe(false);
    });

    it("returns true when fetched 31 days ago", () => {
      const analyst = makeAnalyst({
        fetch_tier: "COLD",
        last_fetched_at: hoursAgo(31 * 24),
      });
      expect(shouldFetchAnalyst(analyst)).toBe(true);
    });
  });
});

describe("getFetchParams", () => {
  it("returns first-fetch params when last_tweet_id is null", () => {
    const analyst = makeAnalyst({ last_tweet_id: null });
    expect(getFetchParams(analyst)).toEqual({ since_id: null, limit: 1000 });
  });

  it("returns incremental params when last_tweet_id is set", () => {
    const analyst = makeAnalyst({ last_tweet_id: "1234567890" });
    expect(getFetchParams(analyst)).toEqual({
      since_id: "1234567890",
      limit: 200,
    });
  });
});
