const pool = require("../config/db");

async function requireAuth(req, res, next) {
  try {
    const userId = req.session?.userId;

    if (!userId) {
      return res.status(401).json({
        error: {
          code: "UNAUTHENTICATED",
          message: "Please log in to continue.",
          details: [],
        },
      });
    }

    const result = await pool.query(
      `SELECT id, name, email
       FROM users
       WHERE id = $1`,
      [userId],
    );

    if (result.rowCount === 0) {
      return req.session.destroy(() => {
        res.clearCookie("spendwise.sid", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
        });

        return res.status(401).json({
          error: {
            code: "UNAUTHENTICATED",
            message: "Please log in to continue.",
            details: [],
          },
        });
      });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = requireAuth;
