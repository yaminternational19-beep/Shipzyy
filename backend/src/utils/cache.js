import { redisClient } from "../config/redis.js";

/**
 * Get data from cache
 * @param {string} key 
 */
export const getFromCache = async (key) => {
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Cache Get Error [${key}]:`, error);
    return null;
  }
};

/**
 * Set data to cache
 * @param {string} key 
 * @param {any} value 
 * @param {number} ttl - Time to live in seconds (default 3600 / 1 hour)
 */
export const setToCache = async (key, value, ttl = 3600) => {
  try {
    const data = JSON.stringify(value);
    await redisClient.set(key, data, {
      EX: ttl,
    });
  } catch (error) {
    console.error(`Cache Set Error [${key}]:`, error);
  }
};

/**
 * Delete data from cache
 * @param {string} key 
 */
export const removeFromCache = async (key) => {
  try {
    await redisClient.del(key);
  } catch (error) {
    console.error(`Cache Del Error [${key}]:`, error);
  }
};

/**
 * Delete data from cache using pattern
 * @param {string} pattern 
 */
export const removeByPattern = async (pattern) => {
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (error) {
    console.error(`Cache Del Pattern Error [${pattern}]:`, error);
  }
};
