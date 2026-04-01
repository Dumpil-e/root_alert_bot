import { rootServer } from "@rootsdk/server-bot";
import type { ChannelGuid, CommunityRoleGuid } from "@rootsdk/server-bot";
import { getRuleForSeverity } from "../config/alertConfig";
import { enqueue } from "../utils/queue";

const roleCache = new Map<string, CommunityRoleGuid>();

async function getRoleId(roleName: string): Promise<CommunityRoleGuid | null> {
    if (roleCache.has(roleName)) return roleCache.get(roleName)!;

    const roles = await rootServer.community.communityRoles.list();
    for (const role of roles) {
        roleCache.set(role.name, role.id);
    }

    return roleCache.get(roleName) ?? null;
}

export async function sendToRoot(channelId: ChannelGuid, text: string, severity: string): Promise<void> {
    const rule = getRuleForSeverity(severity);
    const mentions: string[] = [];

    for (const roleName of rule.mentionRoles) {
        try {
            const roleId = await getRoleId(roleName);
            if (roleId) {
                mentions.push(`[@${roleName}](root://role/${roleId})`);
            }
        } catch {
            console.warn(`Could not get roleId for ${roleName}`);
        }
    }

    const finalText = mentions.length > 0
        ? `${mentions.join(" ")} ${text}`
        : text;

    await rootServer.community.channelMessages.create({
        channelId,
        content: finalText,
    });
}

export function sendMessage(channelId: ChannelGuid, text: string, severity: string): void {
    enqueue(channelId as string, text, severity);
}