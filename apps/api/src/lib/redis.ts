import { Redis } from "ioredis";
import { env } from "../config/env.js";

export const redis = new Redis(env.REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: 1,
  enableOfflineQueue: false,
  retryStrategy: (attempt: number) => Math.min(attempt * 250, 3000),
});

redis.on("error", (error: Error) => {
  if (env.NODE_ENV !== "production") console.warn("Redis connection warning:", error.message);
});

export async function connectRedis() {
  if (redis.status === "wait") await redis.connect();
}

export async function closeRedis() {
  if (redis.status !== "end") await redis.quit();
}
