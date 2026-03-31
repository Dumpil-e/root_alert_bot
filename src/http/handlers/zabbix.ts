import type { Request, Response } from "express";
import { getChannelForSeverity } from "../../bot/router";
import { sendMessage } from "../../bot/sender";

interface ZabbixPayload {
    severity: string;
    message: string;
}

const VALID_SEVERITIES = [
    "Not classified", "Info", "Warning", "Average", "High", "Disaster"
];

export async function handleZabbix(req: Request, res: Response): Promise<void> {
    console.log("=== Incoming Zabbix webhook ===");
    console.log("Body:", req.body);

    const { severity, message } = req.body as ZabbixPayload;

    if (!severity || !message) {
        console.warn("Missing severity or message");
        res.status(400).send("Bad Request: missing fields");
        return;
    }

    if (!VALID_SEVERITIES.includes(severity)) {
        console.warn(`Unknown severity: ${severity}`);
        res.status(400).send("Bad Request: unknown severity");
        return;
    }

    const channel = getChannelForSeverity(severity);
    await sendMessage(channel, message, severity);

    res.send("OK");
}