const bcrypt = require("bcryptjs");
const pool = require("../config/db");

async function registerUser({ name, email, password }) {
  const normalizedName = name.trim();
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await pool.query(
    "SELECT id FROM users WHERE email = $1",
    [normalizedEmail],
  );

  if (existingUser.rowCount > 0) {
    const error = new Error("An account with this email already exists.");
    error.statusCode = 409;
    error.code = "EMAIL_ALREADY_EXISTS";
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at`,
      [normalizedName, normalizedEmail, passwordHash],
    );

    return result.rows[0];
  } catch (error) {
    // The database unique constraint is the final protection
    // against duplicate emails, including concurrent requests.
    if (error.code === "23505") {
      const duplicateError = new Error(
        "An account with this email already exists.",
      );
      duplicateError.statusCode = 409;
      duplicateError.code = "EMAIL_ALREADY_EXISTS";
      throw duplicateError;
    }

    throw error;
  }
}

async function loginUser({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  const result = await pool.query(
    `SELECT id, name, email, password_hash
     FROM users
     WHERE email = $1`,
    [normalizedEmail],
  );

  const user = result.rows[0];

  // Use the same error for unknown emails and incorrect passwords.
  if (!user) {
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    error.code = "INVALID_CREDENTIALS";
    throw error;
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatches) {
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    error.code = "INVALID_CREDENTIALS";
    throw error;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

module.exports = { registerUser, loginUser };
