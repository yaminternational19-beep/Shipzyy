require("dotenv").config();
require("./config/envValidator");



const app = require("./app");
const pool = require("./config/db");

const PORT = process.env.PORT || 9000;

async function startServer() {
  try {

    // Test MySQL connection
    const connection = await pool.getConnection();
    console.log("MySQL connected successfully");
    connection.release();

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

