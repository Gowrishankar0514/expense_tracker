const { getDashboardSummary } = require("../services/dashboardService");

async function getSummary(req, res, next) {
  try {
    const dashboard = await getDashboardSummary(req.user.id);

    return res.status(200).json({
      success: true,
      dashboard,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getSummary };
