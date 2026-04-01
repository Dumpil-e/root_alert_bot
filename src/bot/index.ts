import { startHttpServer } from "../http/server";
import { startWorker } from "../utils/worker";

export async function startBot() {
    startHttpServer();
    startWorker();
}