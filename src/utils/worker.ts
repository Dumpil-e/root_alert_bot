import { getPending, remove, incrementAttempts } from "./queue";
import { sendToRoot } from "../bot/sender";
import type { ChannelGuid } from "@rootsdk/server-bot";

const WORKER_INTERVAL_MS = 5000;
let isProcessing = false;

export function startWorker(): void {
    console.log("Queue worker started");
    setInterval(processQueue, WORKER_INTERVAL_MS);
}

async function processQueue(): Promise<void> {
    if (isProcessing) return;
    isProcessing = true;

    try {
        const messages = getPending();
        if (messages.length === 0) return;

        console.log(`Queue size: ${messages.length}`);

        for (const msg of messages) {
            try {
                const text = msg.attempts > 0
                    ? `${msg.text}\n!!! Сообщение доставлено с попытки ${msg.attempts + 1}`
                    : msg.text;

                await sendToRoot(msg.channelId as ChannelGuid, text, msg.severity);
                remove(msg.id);
                console.log(`Message ${msg.id} sent successfully`);
            } catch (err) {
                incrementAttempts(msg.id);
                console.warn(`Message ${msg.id} failed, attempt ${msg.attempts + 1}, will retry in ${WORKER_INTERVAL_MS / 1000}s`);
                break;
            }
        }
    } finally {
        isProcessing = false;
    }
}