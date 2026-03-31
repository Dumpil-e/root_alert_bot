import type { Request, Response } from "express";
import { sendMessage } from "../../bot/sender";
import { CHANNELS } from "../../config/channels";

export async function handleNotify(req: Request, res: Response): Promise<void> {
    const { message } = req.body;

    if (!message) {
        res.status(400).send("Missing message");
        return;
    }

    await sendMessage(CHANNELS.general, message, "High");
    res.send("OK");
}