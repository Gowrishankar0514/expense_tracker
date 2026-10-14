const pool = require("../config/db");

async function getDashboardSummary(userId) {
  const [totalsResult, monthlyResult, categoryResult, recentResult] =
    await Promise.all([
      // 1. All-time income, expenses, and balance
      pool.query(
        `SELECT
           COALESCE(
             SUM(amount) FILTER (WHERE type = 'income'), 0
           )::numeric(12, 2)::text AS "totalIncome",
           COALESCE(
             SUM(amount) FILTER (WHERE type = 'expense'), 0
           )::numeric(12, 2)::text AS "totalExpenses",
           COALESCE(
             SUM(amount) FILTER (WHERE type = 'income'), 0
           ) -
           COALESCE(
             SUM(amount) FILTER (WHERE type = 'expense'), 0
           ) AS "totalBalance"
         FROM transactions
         WHERE user_id = $1`,
        [userId],
      ),

      // 2. Current month's income and expenses
      pool.query(
        `SELECT
           COALESCE(
             SUM(amount) FILTER (WHERE type = 'income'), 0
           )::numeric(12, 2)::text AS "income",
           COALESCE(
             SUM(amount) FILTER (WHERE type = 'expense'), 0
           )::numeric(12, 2)::text AS "expenses"
         FROM transactions
         WHERE user_id = $1
           AND transaction_date >=
               date_trunc('month', CURRENT_DATE)::date
           AND transaction_date <
               (date_trunc('month', CURRENT_DATE)
                + INTERVAL '1 month')::date`,
        [userId],
      ),

      // 3. Current month's expenses grouped by category
      pool.query(
        `SELECT
           category,
           SUM(amount)::numeric(12, 2)::text AS "totalAmount"
         FROM transactions
         WHERE user_id = $1
           AND type = 'expense'
           AND transaction_date >=
               date_trunc('month', CURRENT_DATE)::date
           AND transaction_date <
               (date_trunc('month', CURRENT_DATE)
                + INTERVAL '1 month')::date
         GROUP BY category
         ORDER BY SUM(amount) DESC`,
        [userId],
      ),

      // 4. Five most recent transactions
      pool.query(
        `SELECT
           id,
           title,
           amount::text AS amount,
           type,
           category,
           transaction_date AS "transactionDate"
         FROM transactions
         WHERE user_id = $1
         ORDER BY transaction_date DESC, id DESC
         LIMIT 5`,
        [userId],
      ),
    ]);

  const totals = totalsResult.rows[0];
  const monthly = monthlyResult.rows[0];

  return {
    summary: {
      totalIncome: totals.totalIncome,
      totalExpenses: totals.totalExpenses,
      totalBalance: Number(totals.totalBalance).toFixed(2),
    },
    monthly: {
      income: monthly.income,
      expenses: monthly.expenses,
    },
    expensesByCategory: categoryResult.rows,
    recentTransactions: recentResult.rows,
  };
}

module.exports = { getDashboardSummary };
