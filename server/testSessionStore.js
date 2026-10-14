require("dotenv").config();

const session = require("express-session");
const connectPgSimple = require("connect-pg-simple");
const pool = require("./config/db");

const PgSession = connectPgSimple(session);

const sessionStore = new PgSession({
  pool,
  tableName: "sessions",
  createTableIfMissing: false,
});

function storeOperation(method, ...args) {
  return new Promise((resolve, reject) => {
    sessionStore[method](...args, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}

async function testSessionStore() {
  const sid = `spendwise-test-${Date.now()}`;

  try {
    const testData = {
      cookie: {
        originalMaxAge: 60000,
        expires: new Date(Date.now() + 60000).toISOString(),
        httpOnly: true,
      },
      testValue: "SpendWise session test",
    };

    // Write a test session to PostgreSQL.
    await storeOperation("set", sid, testData);
    console.log("1. Session saved successfully.");

    // Read the session back.
    const savedSession = await storeOperation("get", sid);

    if (savedSession?.testValue !== testData.testValue) {
      throw new Error("Saved session data did not match.");
    }

    console.log("2. Session retrieved successfully.");

    // Delete the temporary test session.
    await storeOperation("destroy", sid);
    console.log("3. Test session deleted successfully.");

    console.log("Session store verification passed!");
  } catch (error) {
    console.error("Session store test failed:", error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

testSessionStore();
