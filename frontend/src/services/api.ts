import axios from "axios";
import type { Analyst, Insight } from "@/types";
import type { AnalystProfile, StockFitResult } from "@/types/analyst";
import { ApiError } from "./errors";
import {
  mapAnalyst,
  mapAnalystProfile,
  mapInsight,
  mapStockFitResult,
} from "./mappers";

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3001",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

function toHebrewMessage(err: unknown): { message: string; status?: number } {
  if (axios.isAxiosError(err)) {
    if (!err.response) {
      if (err.code === "ECONNABORTED")
        return { message: "השרת איטי – נסה שוב" };
      return { message: "אין חיבור לשרת" };
    }
    const status = err.response.status;
    const messages: Record<number, string> = {
      401: "אין הרשאה",
      403: "גישה אסורה",
      404: "לא נמצא",
      500: "שגיאת שרת – אנא נסה שוב",
    };
    return { message: messages[status] ?? "אירעה שגיאה", status };
  }
  return { message: "אירעה שגיאה" };
}

if (import.meta.env.DEV) {
  http.interceptors.request.use((config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  });
}

http.interceptors.response.use(
  (res) => res,
  (err: unknown) => {
    const { message, status } = toHebrewMessage(err);
    return Promise.reject(new ApiError(message, status, err));
  },
);

export async function getAnalysts(signal?: AbortSignal): Promise<Analyst[]> {
  const res = await http.get<unknown[]>("/api/analysts", { signal });
  return res.data.map(mapAnalyst);
}

export async function getAnalyst(
  username: string,
  signal?: AbortSignal,
): Promise<AnalystProfile> {
  const res = await http.get<unknown>(`/api/analysts/${username}`, { signal });
  return mapAnalystProfile(res.data);
}

export async function getInsights(
  ticker: string,
  signal?: AbortSignal,
): Promise<Insight[]> {
  const res = await http.get<unknown[]>("/api/insights", {
    params: { ticker },
    signal,
  });
  return res.data.map(mapInsight);
}

export async function checkStockFit(
  analystId: string,
  ticker: string,
  signal?: AbortSignal,
): Promise<StockFitResult> {
  const res = await http.post<{ result: unknown }>(
    "/api/stock-fit",
    { analyst_id: analystId, ticker },
    { signal },
  );
  return mapStockFitResult(res.data.result);
}

export async function getUserAnalysts(
  signal?: AbortSignal,
): Promise<unknown[]> {
  const res = await http.get<unknown[]>("/api/user-analysts", { signal });
  return res.data;
}
