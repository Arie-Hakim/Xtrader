import axios from "axios";
import type { Analyst, AnalystDNA, StockFitResult } from "@/types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3001",
  headers: { "Content-Type": "application/json" },
});

if (import.meta.env.DEV) {
  api.interceptors.request.use((config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  });
}

api.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(err),
);

export async function getAnalysts(): Promise<Analyst[]> {
  const { data } = await api.get<Analyst[]>("/api/analysts");
  return data;
}

export async function getAnalystByUsername(
  username: string,
): Promise<{ analyst: Analyst; dna: AnalystDNA | null }> {
  const { data } = await api.get<{ analyst: Analyst; dna: AnalystDNA | null }>(
    `/api/analysts/${username}`,
  );
  return data;
}

export async function checkStockFit(
  analyst_id: string,
  ticker: string,
): Promise<{
  result: StockFitResult;
  cache_hit: boolean;
  plan_remaining: number;
}> {
  const { data } = await api.post<{
    result: StockFitResult;
    cache_hit: boolean;
    plan_remaining: number;
  }>("/api/stock-fit", { analyst_id, ticker });
  return data;
}

export default api;
