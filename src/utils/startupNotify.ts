import { sendToRoot } from "../bot/sender";
import { config } from "../config/alertConfig";
import * as fs from "fs";
import * as path from "path";
import type { ChannelGuid } from "@rootsdk/server-bot";

const FLAG_FILE = path.join(__dirname, "../../.crashed");

export function markCrashed(): void {
    fs.writeFileSync(FLAG_FILE, new Date().toISOString());
}

export async function checkAndNotifyRestart(): Promise<void> {
    if (fs.existsSync(FLAG_FILE)) {
        const crashTime = fs.readFileSync(FLAG_FILE, "utf-8");
        fs.unlinkSync(FLAG_FILE);

        await sendToRoot(
            config.channels["general"] as ChannelGuid,
            `!!! Бот был перезапущен после падения.\nВремя падения: ${crashTime}\nВремя восстановления: ${new Date().toISOString()}`,
            "High"
        );
    }
}