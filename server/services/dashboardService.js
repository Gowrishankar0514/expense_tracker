const pool = require("../config/db");

async function getDashboardSummary(userId, year, month) {
  // 1. Set the selected date range.
  const selectedYear = Number(year);
  const selectedMonth = month === "all" ? "all" : Number(month);

  let startDate;
  let endDate;

  if (selectedMonth === "all") {
    startDate = `${selectedYear}-01-01`;
    endDate = `${selectedYear + 1}-01-01`;
  } else {
    startDate = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-01`;

    const nextMonth = new Date(selectedYear, selectedMonth, 1);

    endDate = `${nextMonth.getFullYear()}-${String(
      nextMonth.getMonth() + 1,
    ).padStart(2, "0")}-01`;
  }

  const [totalsResult, categoryResult] = await Promise.all([
    // 2. Income and expenses for the selected period.
    pool.query(
      `SELECT
         COALESCE(SUM(amount) FILTER (
           WHERE type = 'income'
         ), 0)::numeric(12, 2)::text AS "totalIncome",

         COALESCE(SUM(amount) FILTER (
           WHERE type = 'expense'
         ), 0)::numeric(12, 2)::text AS "totalExpenses"

       FROM transactions
       WHERE user_id = $1
         AND transaction_date >= $2
         AND transaction_date < $3`,
      [userId, startDate, endDate],
    ),

    // 4. Expenses grouped by category for the selected period.
    pool.query(
      `SELECT
         category,
         SUM(amount)::numeric(12, 2)::text AS "totalAmount"

       FROM transactions
       WHERE user_id = $1
         AND type = 'expense'
         AND transaction_date >= $2
         AND transaction_date < $3

       GROUP BY category
       ORDER BY SUM(amount) DESC`,
      [userId, startDate, endDate],
    ),
  ]);

  const totals = totalsResult.rows[0];

  return {
    period: {
      year: selectedYear,
      month: selectedMonth,
      startDate,
      endDate,
    },

    summary: {
      totalIncome: totals.totalIncome,
      totalExpenses: totals.totalExpenses,
      totalBalance: (
        Number(totals.totalIncome) - Number(totals.totalExpenses)
      ).toFixed(2),
    },

    // Used for the income remaining percentage.
    monthly: {
      income: totals.totalIncome,
      expenses: totals.totalExpenses,
    },

    expensesByCategory: categoryResult.rows,
  };
}

module.exports = { getDashboardSummary };
