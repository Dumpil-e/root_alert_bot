import type { Request, Response } from "express";
import { sendToRoot } from "../../bot/sender";
import { config } from "../../config/alertConfig";
import type { ChannelGuid } from "@rootsdk/server-bot";

export async function handleNotify(req: Request, res: Response): Promise<void> {
    const { message } = req.body;

    if (!message) {
        res.status(400).send("Missing message");
        return;
    }

    await sendToRoot(config.channels["general"] as ChannelGuid, message, "High");
    res.send("OK");
}