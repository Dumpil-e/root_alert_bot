import { rootServer } from "@rootsdk/server-bot";
import type { ChannelGuid, CommunityRoleGuid } from "@rootsdk/server-bot";
import { shouldMention } from "./router";
import { withRetry } from "../utils/retry";

async function getRoleId(roleName: string): Promise<CommunityRoleGuid | null> {
    const roles = await rootServer.community.communityRoles.list();
    const role = roles.find(r => r.name === roleName);
    return role?.id ?? null;
}

export async function sendMessage(channelId: ChannelGuid, text: string, severity: string): Promise<void> {
    let finalText = text;

    if (shouldMention(severity)) {
        const roleId = await withRetry(() => getRoleId("Admins"));
        if (roleId) {
            finalText = `[@Admins](root://role/${roleId}) ${text}`;
        }
    }

    await withRetry(() =>
        rootServer.community.channelMessages.create({
            channelId,
            content: finalText,
        })
    );
}