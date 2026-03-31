import { rootServer } from "@rootsdk/server-bot";
import { startBot } from "./bot";
import { markCrashed, checkAndNotifyRestart } from "./utils/startupNotify";

process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
  markCrashed();
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
  markCrashed();
  process.exit(1);
});

(async () => {
  try {
    await rootServer.lifecycle.start(startBot);
    await checkAndNotifyRestart();
  } catch (err) {
    console.error("Fatal error during bot startup:", err);
    markCrashed();
    process.exit(1);
  }
})();
