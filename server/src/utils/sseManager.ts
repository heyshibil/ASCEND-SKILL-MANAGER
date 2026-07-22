import { Redis } from "ioredis";
import type { Response } from "express";
import { randomUUID } from "crypto";

// ─── Constants ──────────────────────────────────────────────────────────────────
const CHANNEL = "market:updates";
const HEARTBEAT_INTERVAL_MS = 25_000; // 25s — safely under Nginx/ALB 60s timeout

// ─── Types ──────────────────────────────────────────────────────────────────────
interface SSEClient {
  res: Response;
  heartbeat: ReturnType<typeof setInterval>;
}

// ─── Module State ───────────────────────────────────────────────────────────────

/** UUID-keyed map of all SSE clients connected to THIS process. */
const clients = new Map<string, SSEClient>();

/**
 * Dedicated Redis connections for Pub/Sub.
 */
let publisher: Redis | null = null;
let subscriber: Redis | null = null;
let isSubscribed = false;

// ─── Initialization ─────────────────────────────────────────────────────────────

/**
 * Call once at server startup (e.g. in server.ts after connectDB()).
 * Creates the publisher + subscriber Redis connections and wires up the
 * subscription handler that feeds all local SSE clients.
 */
export function initSSEManager(): void {
  const redisUrl = process.env.REDIS_URL as string;
  const opts = { maxRetriesPerRequest: null, enableReadyCheck: false };

  publisher = new Redis(redisUrl, opts);
  subscriber = new Redis(redisUrl, opts);

  publisher.on("error", (err) =>
    console.error("❌ SSE Publisher Redis error:", err),
  );
  subscriber.on("error", (err) =>
    console.error("❌ SSE Subscriber Redis error:", err),
  );

  // Subscribe once — the handler broadcasts to every local SSE client
  subscriber.subscribe(CHANNEL, (err) => {
    if (err) {
      console.error("❌ Failed to subscribe to", CHANNEL, err);
      return;
    }
    isSubscribed = true;
    console.log(`✅ SSE Manager subscribed to Redis channel: ${CHANNEL}`);
  });

  subscriber.on("message", (_channel: string, message: string) => {
    broadcastToLocalClients(message);
  });
}

// ─── Client Management ──────────────────────────────────────────────────────────

/**
 * Registers a new SSE client and starts its heartbeat timer.
 * Returns the clientId so the caller can clean up later if needed.
 */
export function addClient(res: Response): string {
  const clientId = randomUUID();

  const heartbeat = setInterval(() => {
    try {
      res.write(": ping\n\n");
    } catch {
        // Client already disconnected — clean up silently
      removeClient(clientId);
    }
  }, HEARTBEAT_INTERVAL_MS);

  clients.set(clientId, { res, heartbeat });
  return clientId;
}

/**
 * Removes a client and clears its heartbeat timer.
 * Safe to call multiple times with the same ID.
 */
export function removeClient(clientId: string): void {
  const client = clients.get(clientId);
  if (!client) return;

  clearInterval(client.heartbeat);
  clients.delete(clientId);
}

/** Current number of SSE connections on this process (useful for logging). */
export function getClientCount(): number {
  return clients.size;
}

// ─── Publishing ─────────────────────────────────────────────────────────────────

/**
 * Publishes a market event to Redis so that ALL server processes receive it
 * and broadcast to their local SSE clients.
 *
 * @param event - A pre-serialized JSON string (e.g. `{ type: "NEW_SKILL", payload: {...} }`)
 */
export function publishMarketEvent(event: object): void {
  if (!publisher) {
    console.error("SSE Manager not initialized — call initSSEManager() first");
    return;
  }
  publisher.publish(CHANNEL, JSON.stringify(event));
}

// ─── Internal Broadcast ─────────────────────────────────────────────────────────

/**
 * Writes an SSE data frame to every locally-connected client.
 * If a write fails (client disconnected but `close` event hasn't fired yet),
 * the client is removed immediately to prevent memory leaks.
 */
function broadcastToLocalClients(serializedEvent: string): void {
  const frame = `data: ${serializedEvent}\n\n`;

  for (const [clientId, client] of clients) {
    try {
      client.res.write(frame);
    } catch {
      // Write failed → client is dead, clean up
      removeClient(clientId);
    }
  }
}
