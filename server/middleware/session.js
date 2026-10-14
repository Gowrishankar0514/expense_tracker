require("dotenv").config();

const session = require("express-session");
const connectPgSimple = require("connect-pg-simple");
const pool = require("../config/db");

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET is missing from .env");
}

const PgSession = connectPgSimple(session);

const sessionStore = new PgSession({
  pool,
  tableName: "sessions",
  createTableIfMissing: false,
});

const sessionMiddleware = session({
  name: "spendwise.sid",
  secret: process.env.SESSION_SECRET,
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24,
  },
});

module.exports = sessionMiddleware;
