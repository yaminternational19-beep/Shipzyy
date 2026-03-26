import express from "express";
import { redisClient } from "../config/redis.js";

const router = express.Router();

router.get("/redis-test", async (req, res) => {
  try {
    await redisClient.set("testKey", "Redis is working");
    const value = await redisClient.get("testKey");

    res.json({
      success: true,
      message: value
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;