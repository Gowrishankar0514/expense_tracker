"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [category, setCategory] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const limit = 10;

  useEffect(() => {
    async function loadTransactions() {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit),
        });

        if (search.trim()) params.set("search", search.trim());
        if (type) params.set("type", type);
        if (category.trim()) params.set("category", category.trim());
        if (from) params.set("from", from);
        if (to) params.set("to", to);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/transactions?${params}`,
          { credentials: "include" },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error?.message ||
              data.message ||
              "Could not load transactions.",
          );
        }

        setTransactions(data.transactions || []);
      } catch (err) {
        setError(err.message || "Unable to connect to the server.");
      } finally {
        setLoading(false);
      }
    }

    loadTransactions();
  }, [page, search, type, category, from, to]);

  const formatMoney = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(Number(amount || 0));

  function formatDate(date) {
    if (!date) return "—";

    const datePart = String(date).slice(0, 10);
    const [year, month, day] = datePart.split("-");

    return `${day}-${month}-${year}`;
  }

  function changeFilter(setter, value) {
    setter(value);
    setPage(1);
    setMessage("");
  }

  function clearFilters() {
    setSearch("");
    setType("");
    setCategory("");
    setFrom("");
    setTo("");
    setPage(1);
    setMessage("");
    setError("");
  }

  function startEditing(transaction) {
    setEditingId(transaction.id);
    setEditForm({
      title: transaction.title || "",
      amount: transaction.amount || "",
      type: transaction.type || "expense",
      category: transaction.category || "",
      transactionDate: String(transaction.transactionDate || "").slice(0, 10),
    });
    setMessage("");
    setError("");
  }

  function updateEditField(field, value) {
    setEditForm((current) => ({ ...current, [field]: value }));
  }

  async function saveEdit(id) {
    setSavingId(id);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/transactions/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            ...editForm,
            amount: Number(editForm.amount),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error?.message ||
            data.message ||
            "Could not update transaction.",
        );
      }

      setEditingId(null);
      setMessage("Transaction updated successfully.");
      await refreshTransactions();
    } catch (err) {
      setError(err.message || "Could not update transaction.");
    } finally {
      setSavingId(null);
    }
  }

  async function deleteTransaction(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this transaction?",
    );

    if (!confirmed) return;

    setDeletingId(id);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/transactions/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error?.message ||
            data.message ||
            "Could not delete transaction.",
        );
      }

      setMessage("Transaction deleted successfully.");

      if (transactions.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await refreshTransactions();
      }
    } catch (err) {
      setError(err.message || "Could not delete transaction.");
    } finally {
      setDeletingId(null);
    }
  }

  async function refreshTransactions() {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

    if (search.trim()) params.set("search", search.trim());
    if (type) params.set("type", type);
    if (category.trim()) params.set("category", category.trim());
    if (from) params.set("from", from);
    if (to) params.set("to", to);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/transactions?${params}`,
      { credentials: "include" },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Could not refresh transactions.");
    }

    setTransactions(data.transactions || []);
  }

  return (
    <div className="app-layout">
      <Sidebar activePage="Transactions" />

      <main className="dashboard-content transactions-page">
        <div className="transactions-header">
          <div>
            <h1>Transactions</h1>
            <p className="dashboard-subtitle">
              View and manage your income and expenses
            </p>
          </div>

          <a className="add-transaction-button" href="/transactions/new">
            + Add Transaction
          </a>
        </div>

        <section className="transaction-filter-panel">
          <select
            aria-label="Filter by type"
            value={type}
            onChange={(event) => changeFilter(setType, event.target.value)}
          >
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <select
            aria-label="Filter by category"
            value={category}
            onChange={(event) => changeFilter(setCategory, event.target.value)}
          >
            <option value="">All Categories</option>
            <option value="Food">Food</option>
            <option value="Transport">Transport</option>
            <option value="Shopping">Shopping</option>
            <option value="Bills">Bills</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Others">Others</option>
          </select>

          <label className="date-filter">
            <span>From Date</span>
            <input
              aria-label="From date"
              type="date"
              value={from}
              onChange={(event) => changeFilter(setFrom, event.target.value)}
            />
          </label>

          <label className="date-filter">
            <span>To Date</span>
            <input
              aria-label="To date"
              type="date"
              value={to}
              onChange={(event) => changeFilter(setTo, event.target.value)}
            />
          </label>

          <button className="clear-filters" onClick={clearFilters}>
            Clear
          </button>
        </section>

        <section className="transaction-list-panel">
          <div className="transaction-search-row">
            <input
              type="search"
              aria-label="Search transactions"
              placeholder="Search by title..."
              value={search}
              onChange={(event) => changeFilter(setSearch, event.target.value)}
            />
          </div>

          {error && <p className="login-error">{error}</p>}
          {message && <p className="transaction-success">{message}</p>}

          {loading ? (
            <p className="transaction-status">Loading transactions...</p>
          ) : transactions.length === 0 ? (
            <p className="transaction-status">
              No transactions found. Click Add Transaction to create one.
            </p>
          ) : (
            <div className="transaction-table-wrapper">
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      {editingId === transaction.id ? (
                        <>
                          <td>
                            <input
                              aria-label="Edit transaction date"
                              type="date"
                              value={editForm.transactionDate}
                              onChange={(event) =>
                                updateEditField(
                                  "transactionDate",
                                  event.target.value,
                                )
                              }
                            />
                          </td>
                          <td>
                            <input
                              aria-label="Edit title"
                              value={editForm.title}
                              onChange={(event) =>
                                updateEditField("title", event.target.value)
                              }
                            />
                          </td>
                          <td>
                            <select
                              aria-label="Edit type"
                              value={editForm.type}
                              onChange={(event) =>
                                updateEditField("type", event.target.value)
                              }
                            >
                              <option value="income">Income</option>
                              <option value="expense">Expense</option>
                            </select>
                          </td>
                          <td>
                            <select
                              id="category"
                              name="category"
                              defaultValue=""
                              required
                            >
                              <option value="" disabled>
                                Select category
                              </option>
                              <option value="Food">Food</option>
                              <option value="Transport">Transport</option>
                              <option value="Shopping">Shopping</option>
                              <option value="Bills">Bills</option>
                              <option value="Healthcare">Healthcare</option>
                              <option value="Others">Others</option>
                            </select>
                          </td>
                          <td>
                            <input
                              aria-label="Edit amount"
                              type="number"
                              min="0.01"
                              step="0.01"
                              value={editForm.amount}
                              onChange={(event) =>
                                updateEditField("amount", event.target.value)
                              }
                            />
                          </td>
                          <td className="transaction-actions">
                            <button
                              className="action-button save-action"
                              disabled={savingId === transaction.id}
                              onClick={() => saveEdit(transaction.id)}
                            >
                              {savingId === transaction.id
                                ? "Saving..."
                                : "Save"}
                            </button>
                            <button
                              className="action-button"
                              onClick={() => setEditingId(null)}
                            >
                              Cancel
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td>{formatDate(transaction.transactionDate)}</td>
                          <td>
                            <div>{transaction.title}</div>
                            {transaction.notes && (
                              <small className="transaction-notes">
                                {transaction.notes}
                              </small>
                            )}
                          </td>
                          <td>
                            <span
                              className={`transaction-type ${
                                transaction.type === "income"
                                  ? "type-income"
                                  : "type-expense"
                              }`}
                            >
                              {transaction.type === "income"
                                ? "Income"
                                : "Expense"}
                            </span>
                          </td>
                          <td>{transaction.category}</td>
                          <td
                            className={
                              transaction.type === "income"
                                ? "income-amount"
                                : "expense-amount"
                            }
                          >
                            {transaction.type === "income" ? "+" : "-"}
                            {formatMoney(transaction.amount)}
                          </td>
                          <td className="transaction-actions">
                            <button
                              className="action-button edit-action"
                              aria-label={`Edit ${transaction.title}`}
                              title="Edit transaction"
                              onClick={() => startEditing(transaction)}
                            >
                              ✎
                            </button>
                            <button
                              className="action-button delete-action"
                              aria-label={`Delete ${transaction.title}`}
                              title="Delete transaction"
                              disabled={deletingId === transaction.id}
                              onClick={() => deleteTransaction(transaction.id)}
                            >
                              {deletingId === transaction.id ? "…" : "❌"}
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="transaction-pagination">
            <span>
              Showing {transactions.length ? (page - 1) * limit + 1 : 0}–
              {(page - 1) * limit + transactions.length} transactions on this
              page
            </span>

            <div className="pagination-buttons">
              <button
                disabled={page === 1 || loading}
                onClick={() => setPage((current) => current - 1)}
              >
                ‹
              </button>
              <span className="current-page">{page}</span>
              <button
                disabled={loading || transactions.length < limit}
                onClick={() => setPage((current) => current + 1)}
              >
                ›
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
