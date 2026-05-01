import cron from "node-cron";
import { logger } from "../middleware/logger";
import { rebalanceTiers } from "../services/adaptiveFetch";
import { runDailyFetch } from "../services/fetcherService";

export function startScheduler(): void {
  // Daily fetch at 06:00
  cron.schedule("0 6 * * *", async () => {
    logger.info("שליפה יומית מתחילה...");
    try {
      const result = await runDailyFetch();
      logger.info(result, "שליפה יומית הסתיימה");
    } catch (err) {
      logger.error({ err }, "שליפה יומית נכשלה");
    }
  });

  // Nightly tier rebalance at 02:00
  cron.schedule("0 2 * * *", async () => {
    logger.info("איזון טיירים מתחיל...");
    try {
      const result = await rebalanceTiers();
      logger.info(result, "איזון טיירים הסתיים");
    } catch (err) {
      logger.error({ err }, "איזון טיירים נכשל");
    }
  });

  logger.info("⏰ Scheduler פעיל – שליפה יומית ב-06:00, איזון טיירים ב-02:00");
}
