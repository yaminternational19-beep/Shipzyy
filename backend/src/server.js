import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import pool from './config/db.js';
import { connectRedis } from "./config/redis.js";



const PORT = process.env.PORT || 9000;

async function startServer() {
  try {

    // Test MySQL connection
    const connection = await pool.getConnection();
    console.log("MySQL connected successfully");
    connection.release();

    // Connect Redis
    await connectRedis();
    console.log("Redis connected successfully");

    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
}

startServer();

// app.listen(PORT, () => {
//       console.log(`Server running on port ${PORT}`);
//     });