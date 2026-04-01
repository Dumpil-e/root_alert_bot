import Database from "better-sqlite3";
import path from "path";

const db = new Database(path.join(__dirname, "../../queue.sqlite3"));

db.exec(`
    CREATE TABLE IF NOT EXISTS message_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    channelId TEXT NOT NULL,
    text TEXT NOT NULL,
    severity TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    attempts INTEGER DEFAULT 0
    )
`);

export interface QueuedMessage {
    id: number;
    channelId: string;
    text: string;
    severity: string;
    createdAt: string;
    attempts: number;
}

export function enqueue(channelId: string, text: string, severity: string): void {
    db.prepare(`
        INSERT INTO message_queue (channelId, text, severity, createdAt)
        VALUES (?, ?, ?, ?)
    `).run(channelId, text, severity, new Date().toISOString());
}

export function getPending(): QueuedMessage[] {
    return db.prepare(`
        SELECT * FROM message_queue ORDER BY id ASC LIMIT 10
    `).all() as QueuedMessage[];
}

export function remove(id: number): void {
    db.prepare(`DELETE FROM message_queue WHERE id = ?`).run(id);
}

export function incrementAttempts(id: number): void {
    db.prepare(`UPDATE message_queue SET attempts = attempts + 1 WHERE id = ?`).run(id);
}