import { sendMessage } from "../bot/sender";
import { CHANNELS } from "../config/channels";
import * as fs from "fs"
import * as path from "path";

// При старте проверяет было ли предущая остановка сервиса падением и отправляет алерт
const FLAG_FILE = path.join(__dirname, '../../.crashed');

export function markCrashed(): void {
    fs.writeFileSync(FLAG_FILE, new Date().toISOString());
}

export async function checkAndNotifyRestart(): Promise<void> {
    if (fs.existsSync(FLAG_FILE)) {
        const crashTime = fs.readFileSync(FLAG_FILE, "utf8");
        fs.unlinkSync(FLAG_FILE);

        await sendMessage(
            CHANNELS.general,
            `Бот был перезапущен после падения.\nВремя падения: ${crashTime}\nВремя восстановления: ${new Date().toISOString()}`,
            "High"
        );
    }
}