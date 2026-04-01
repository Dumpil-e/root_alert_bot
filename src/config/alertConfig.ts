import * as fs from "fs";
import * as path from "path";
import type { ChannelGuid } from "@rootsdk/server-bot";

interface AlertRule {
    channel: string;
    mentionRoles: string[];
}

interface Config {
    channels: Record<string, string>;
    rules: Record<string, AlertRule>;
}

function loadConfig(): Config {
    const configPath = path.join(__dirname, "../../config.json");

    if (!fs.existsSync(configPath)) {
        console.error("config.json not found! Copy config.example.json to config.json and fill it in.");
        process.exit(1);
    }

    const raw = fs.readFileSync(configPath, "utf-8");

    try {
        return JSON.parse(raw) as Config;
    } catch (err) {
        console.error("config.json is invalid JSON!", err);
        process.exit(1);
    }
}

export const config = loadConfig();

export interface ResolvedRule {
    channel: ChannelGuid;
    mentionRoles: string[];
}

export function getRuleForSeverity(severity: string): ResolvedRule {
    const rule = config.rules[severity] ?? config.rules["Average"];
    const channel = config.channels[rule.channel];

    if (!channel) {
        console.error(`Channel "${rule.channel}" not found in config.json, using general`);
        return {
            channel: config.channels["general"] as ChannelGuid,
            mentionRoles: rule.mentionRoles,
        };
    }

    return {
        channel: channel as ChannelGuid,
        mentionRoles: rule.mentionRoles,
    };
}