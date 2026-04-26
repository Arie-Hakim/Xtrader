import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import express from "express";
import helmet from "helmet";
import { errorHandler } from "./middleware/errorHandler";
import { httpLogger } from "./middleware/logger";
import { rateLimiter } from "./middleware/rateLimiter";
import adminRouter from "./routes/admin";
import analystsRouter from "./routes/analysts";
import healthRouter from "./routes/health";
import insightsRouter from "./routes/insights";
import stockFitRouter from "./routes/stockFit";
import userAnalystsRouter from "./routes/userAnalysts";

const app = express();
const PORT = process.env.PORT ?? 3001;

// Security
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
    credentials: true,
  }),
);

// Rate limiting — applied before routes
app.use(rateLimiter);

// Logging + body parsing
app.use(httpLogger);
app.use(express.json());

// Routes
app.use("/health", healthRouter);
app.use("/api/analysts", analystsRouter);
app.use("/api/insights", insightsRouter);
app.use("/api/stock-fit", stockFitRouter);
app.use("/api/user-analysts", userAnalystsRouter);
app.use("/api/admin", adminRouter);

// Global error handler — must be last
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 XTrader backend running on http://localhost:${PORT}`);
});

export default app;
