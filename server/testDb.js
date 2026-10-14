const pool = require("./config/db");

async function testConnection() {
  try {
    const result = await pool.query(`
      SELECT
        current_database() AS database,
        NOW() AS current_time
    `);

    console.log("PostgreSQL connected successfully!");
    console.log(result.rows[0]);
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

testConnection();
