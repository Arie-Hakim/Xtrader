import axios from "axios";
import type { Analyst, AnalystDNA, StockFitResult } from "@/types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3001",
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
