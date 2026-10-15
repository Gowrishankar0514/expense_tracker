const pool = require("../config/db");

async function createTransaction(userId, data) {
  const result = await pool.query(
    `INSERT INTO transactions
      (user_id, title, amount, type, category, transaction_date)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, title, amount, type, category,
               TO_CHAR(transaction_date, 'YYYY-MM-DD') AS "transactionDate",
                created_at AS "createdAt"`,
    [
      userId,
      data.title,
      data.amount,
      data.type,
      data.category,
      data.transactionDate,
    ],
  );

  return result.rows[0];
}

async function listTransactions(userId, filters) {
  const conditions = ["user_id = $1"];
  const values = [userId];

  function addCondition(sql, value) {
    values.push(value);
    conditions.push(sql.replace("?", `$${values.length}`));
  }

  if (filters.type) {
    addCondition("type = ?", filters.type);
  }

  if (filters.category) {
    addCondition("category = ?", filters.category);
  }

  if (filters.from) {
    addCondition("transaction_date >= ?::date", filters.from);
  }

  if (filters.to) {
    addCondition("transaction_date <= ?::date", filters.to);
  }

  if (filters.search) {
    addCondition("title ILIKE ?", `%${filters.search}%`);
  }

  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 10;
  const offset = (page - 1) * limit;

  values.push(limit, offset);

  const result = await pool.query(
    `SELECT id, title, amount, type, category,
            TO_CHAR(transaction_date, 'YYYY-MM-DD') AS "transactionDate", created_at AS "createdAt"
     FROM transactions
     WHERE ${conditions.join(" AND ")}
     ORDER BY transaction_date DESC, id DESC
     LIMIT $${values.length - 1}
     OFFSET $${values.length}`,
    values,
  );

  return {
    transactions: result.rows,
    page,
    limit,
  };
}

async function updateTransaction(userId, transactionId, data) {
  const result = await pool.query(
    `UPDATE transactions
     SET title = $1,
         amount = $2,
         type = $3,
         category = $4,
         transaction_date = $5,
         
         updated_at = NOW()
     WHERE id = $6 AND user_id = $7
     RETURNING id, title, amount, type, category,
             TO_CHAR(transaction_date, 'YYYY-MM-DD') AS "transactionDate", created_at AS "createdAt",
               updated_at AS "updatedAt"`,
    [
      data.title,
      data.amount,
      data.type,
      data.category,
      data.transactionDate,

      transactionId,
      userId,
    ],
  );

  return result.rows[0] || null;
}

async function deleteTransaction(userId, transactionId) {
  const result = await pool.query(
    `DELETE FROM transactions
     WHERE id = $1 AND user_id = $2
     RETURNING id`,
    [transactionId, userId],
  );

  return result.rowCount > 0;
}

module.exports = {
  createTransaction,
  listTransactions,
  updateTransaction,
  deleteTransaction,
};
