import { createClient } from "redis";

let redis, pub, sub;
let isInitialized = false;

export async function initializeRedis() {
  if (!isInitialized) {
    redis = createClient({ url: "redis://127.0.0.1:6379" });
    pub = redis.duplicate();
    sub = redis.duplicate();

    try {
      await redis.connect();
      await pub.connect();
      await sub.connect();
      isInitialized = true;
      console.log(`Redis Connected ✅ [PID: ${process.pid}]`);
      return { redis, pub, sub };
    } catch (error) {
      console.error(`Redis connection error [PID: ${process.pid}]:`, error);
      throw error;
    }
  }
  return { redis, pub, sub };
}

export { redis, pub, sub };





















// // redisClient.js
// import { createClient } from "redis";

// // Create connections without immediately connecting
// const redis = createClient({ url: "redis://127.0.0.1:6379" });
// const pub = redis.duplicate();
// const sub = redis.duplicate();

// // Initialize function
// export async function initializeRedis() {
//   try {
//     await redis.connect();
//     await pub.connect();
//     await sub.connect();
//     console.log("Redis Connected ✅");
//     return { redis, pub, sub };
//   } catch (error) {
//     console.error("Redis connection error:", error);
//     throw error;
//   }
// }

// // Export connections directly
// export { redis, pub, sub };




// import { createClient } from "redis";

// const redis = createClient({ url: "redis://127.0.0.1:6379" });
// const pub = redis.duplicate();
// const sub = redis.duplicate();

// await redis.connect();
// await pub.connect();
// await sub.connect();

// console.log("Redis Connected ✅");

// export { redis, pub, sub };
