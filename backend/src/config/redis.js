import { createClient } from "redis";

const redisUrl =
  process.env.NODE_ENV === "production"
    ? process.env.REDIS_URL_PROD
    : process.env.REDIS_URL_DEV;

const redisClient = createClient({
  url: redisUrl,
});

redisClient.on("error", (err) => {
  console.log("Redis Error:", err);
});

redisClient.on("connect", () => {
  console.log("Redis Connected");
});

const connectRedis = async () => {
  await redisClient.connect();
};

export { redisClient, connectRedis };