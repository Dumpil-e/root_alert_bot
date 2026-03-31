import { CHANNELS } from "../config/channels";
import type { ChannelGuid } from "@rootsdk/server-bot";

const MENTION_SEVERITIES = ["Average", "High", "Disaster"];

export function shouldMention(severity: string): boolean {
    return MENTION_SEVERITIES.includes(severity);
}

export function getChannelForSeverity(severity: string): ChannelGuid {
    if (severity === "Not classified" || severity === "Info") return CHANNELS.info;
    if (severity === "Warning") return CHANNELS.warning;
    return CHANNELS.general; // Average, High, Disaster
}