import { createClient } from "redis";

const redis = createClient({ url: "redis://127.0.0.1:6379" });
const pub = redis.duplicate();
const sub = redis.duplicate();

await redis.connect();
await pub.connect();
await sub.connect();

console.log("Redis Connected ✅");

export { redis, pub, sub };
