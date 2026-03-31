export const RETRY_ATTEMPTS = 3;
export const RETRY_DELAY_MS = 2000;

async function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function withRetry<T>(fn: () => Promise<T>, attempts = RETRY_ATTEMPTS, delay = RETRY_DELAY_MS): Promise<T> {
    let lastError: unknown;

    for (let i = 1; i <= attempts; i++) {
        try {
            return await fn();
        } catch (err) {
            lastError = err;
            console.warn(`Attempt ${i}/${attempts} failed:`, err);
            if (i < attempts) {
                await sleep(delay * i);
            }
        }
    }

    throw lastError;
}