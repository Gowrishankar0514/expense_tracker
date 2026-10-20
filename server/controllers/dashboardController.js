const { getDashboardSummary } = require("../services/dashboardService");

async function getSummary(req, res, next) {
  try {
    // 1. Read year and month from the URL.
    const now = new Date();

    const year =
      req.query.year === undefined ? now.getFullYear() : Number(req.query.year);

    const month =
      req.query.month === undefined
        ? String(now.getMonth() + 1)
        : req.query.month;

    // 2. Validate the year.
    if (!Number.isInteger(year) || year < 1900 || year > 9999) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_YEAR",
          message: "Please provide a valid year.",
        },
      });
    }

    // 3. Validate the month.
    if (
      month !== "all" &&
      (!/^\d{1,2}$/.test(String(month)) ||
        Number(month) < 1 ||
        Number(month) > 12)
    ) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_MONTH",
          message: "Month must be between 1 and 12, or all.",
        },
      });
    }

    // 4. Fetch data for the logged-in user and selected period.
    const dashboard = await getDashboardSummary(
      req.user.id,
      year,
      month === "all" ? "all" : Number(month),
    );

    // 5. Send the result to the frontend.
    return res.status(200).json({
      success: true,
      dashboard,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getSummary };
