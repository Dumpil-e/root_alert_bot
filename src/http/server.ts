import express from "express"
import { handleZabbix } from "./handlers/zabbix";
import { authMiddleware } from "./middleware/auth";
import { handleNotify } from "./handlers/notify";

export function startHttpServer() {
    const app = express();
    app.use(express.json());

    app.post("/zabbix", authMiddleware, handleZabbix);

    const port = 3000;
    app.listen(port, () => console.log(`Listening on port ${port}`));

    app.post("/notify", (req, res, next) => {
        if (req.ip !== "127.0.0.1" && req.ip !== "::1") {
            res.status(403).send("Forbidden");
            return;
        }
        next();
    }, handleNotify);

}

