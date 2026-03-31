import type { Request, Response, NextFunction } from "express";

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
    const secret = process.env.ZABBIX_SECRET;

    if (!secret) {
        console.error("ZABBIX_SECRET не задан в .env!");
        res.status(500).send("Server misconfigured");
        return;
    }

    const token = req.headers["x-secret-token"];

    if (!token || token !== secret) {
        console.warn(`Unauthorized request from ${req.ip}`);
        res.status(401).send("Unauthorized");
        return;
    }
    next();
}