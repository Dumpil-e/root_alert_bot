import express from "express";
import { handleZabbix } from "./handlers/zabbix";
import { authMiddleware } from "./middleware/auth";
import { handleNotify } from "./handlers/notify";

export function startHttpServer() {
    const app = express();
    app.use(express.json());

    app.get("/health", (req, res) => {
        res.json({
            status: "ok",
            uptime: Math.floor(process.uptime()),
            timestamp: new Date().toISOString()
        });
    });

    app.post("/zabbix", authMiddleware, handleZabbix);

    app.post("/notify", (req, res, next) => {
        const ip = req.ip || "";
        const isLocalhost =
            ip === "127.0.0.1" ||
            ip === "::1" ||
            ip === "::ffff:127.0.0.1" ||
            ip.includes("127.0.0.1");

        if (!isLocalhost) {
            res.status(403).send("Forbidden");
            return;
        }
        next();
    }, handleNotify);

    const port = 3000;
    app.listen(port, () => console.log(`Listening on port ${port}`));
}