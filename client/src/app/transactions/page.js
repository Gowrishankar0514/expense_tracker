"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTransactionError, setNewTransactionError] = useState("");

  const [newTransaction, setNewTransaction] = useState({
    title: "",
    amount: "",
    type: "",
    category: "",
    transactionDate: new Date().toLocaleDateString("en-CA"),
  });

  const limit = 10;

  useEffect(() => {
    async function loadTransactions() {
      const token = localStorage.getItem("spendwiseToken");

      if (!token) {
        window.location.href = "/";
        return;
      }

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
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
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
    const token = localStorage.getItem("spendwiseToken");

    if (!token) {
      window.location.href = "/";
      return;
    }
    setSavingId(id);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/transactions/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

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
      setMessage("");
      await refreshTransactions();
    } catch (err) {
      setError(err.message || "Could not update transaction.");
    } finally {
      setSavingId(null);
    }
  }

  async function deleteTransaction(id) {
    const token = localStorage.getItem("spendwiseToken");

    if (!token) {
      window.location.href = "/";
      return;
    }
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
          headers: {
            Authorization: `Bearer ${token}`,
          },
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

      setMessage("");

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
    const token = localStorage.getItem("spendwiseToken");

    if (!token) {
      window.location.href = "/";
      return;
    }
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
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Could not refresh transactions.");
    }

    setTransactions(data.transactions || []);
  }
  const expenseCategories = [
    "Food",
    "Healthcare",
    "Transport",
    "Bills",
    "Shopping",
    "Others",
  ];

  const incomeCategories = [
    "Salary",
    "Freelance",
    "Business",
    "Investments",
    "Other Income",
  ];

  const availableCategories =
    newTransaction.type === "income"
      ? incomeCategories
      : newTransaction.type === "expense"
        ? expenseCategories
        : [];
  async function handleAddTransaction(event) {
    event.preventDefault();

    const token = localStorage.getItem("spendwiseToken");

    if (!token) {
      window.location.href = "/";
      return;
    }

    setCreating(true);
    setNewTransactionError("");
    setError("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/transactions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...newTransaction,
            amount: Number(newTransaction.amount),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error?.message ||
            data.message ||
            "Could not create transaction.",
        );
      }

      setIsAddModalOpen(false);
      setNewTransaction({
        title: "",
        amount: "",
        type: "",
        category: "",
        transactionDate: getTodayDate(),
      });

      try {
        await refreshTransactions();
      } catch (err) {
        setError(
          err.message || "Transaction saved, but the list could not refresh.",
        );
      }
    } catch (err) {
      setNewTransactionError(err.message || "Could not create transaction.");
    } finally {
      setCreating(false);
    }
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

          <button
            type="button"
            className="add-transaction-button"
            onClick={() => {
              setNewTransaction({
                title: "",
                amount: "",
                type: "",
                category: "",
                transactionDate: getTodayDate(),
              });
              setNewTransactionError("");
              setIsAddModalOpen(true);
            }}
          >
            + Add Transaction
          </button>
        </div>

        <section className="transaction-filter-panel">
          <select
            aria-label="Filter by type"
            value={type}
            onChange={(event) => {
              setType(event.target.value);
              setCategory("");
              setPage(1);
              setMessage("");
            }}
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
            {(type === "income"
              ? incomeCategories
              : type === "expense"
                ? expenseCategories
                : [...incomeCategories, ...expenseCategories]
            ).map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
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
                              max={getTodayDate()}
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
                              onChange={(event) => {
                                const selectedType = event.target.value;

                                updateEditField("type", selectedType);
                                updateEditField("category", "");
                              }}
                            >
                              <option value="income">Income</option>
                              <option value="expense">Expense</option>
                            </select>
                          </td>
                          <td>
                            <select
                              id="category"
                              name="category"
                              value={editForm.category || ""}
                              onChange={(event) =>
                                updateEditField("category", event.target.value)
                              }
                              required
                            >
                              <option value="" disabled>
                                Select category
                              </option>

                              {(editForm.type === "income"
                                ? incomeCategories
                                : expenseCategories
                              ).map((item) => (
                                <option key={item} value={item}>
                                  {item}
                                </option>
                              ))}
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
        {isAddModalOpen && (
          <div
            className="transaction-modal-overlay"
            onClick={() => setIsAddModalOpen(false)}
          >
            <div
              className="transaction-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="add-transaction-title"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="transaction-modal-header">
                <h2 id="add-transaction-title">Add Transaction</h2>

                <button
                  type="button"
                  className="transaction-modal-close"
                  aria-label="Close popup"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleAddTransaction}>
                <label>
                  Title
                  <input
                    type="text"
                    maxLength={75}
                    required
                    value={newTransaction.title}
                    onChange={(event) =>
                      setNewTransaction((current) => ({
                        ...current,
                        title: event.target.value,
                      }))
                    }
                  />
                </label>

                <label>
                  Amount
                  <input
                    type="number"
                    min="0.01"
                    max="9999999999.99"
                    step="0.01"
                    required
                    value={newTransaction.amount}
                    onKeyDown={(event) => {
                      if (["e", "E", "+", "-"].includes(event.key)) {
                        event.preventDefault();
                      }
                    }}
                    onChange={(event) =>
                      setNewTransaction((current) => ({
                        ...current,
                        amount: event.target.value,
                      }))
                    }
                  />
                </label>

                <label>
                  Type
                  <select
                    required
                    value={newTransaction.type}
                    onChange={(event) =>
                      setNewTransaction((current) => ({
                        ...current,
                        type: event.target.value,
                        category: "",
                      }))
                    }
                  >
                    <option value="">Select type</option>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </label>

                <label>
                  Category
                  <select
                    required
                    value={newTransaction.category}
                    onChange={(event) =>
                      setNewTransaction((current) => ({
                        ...current,
                        category: event.target.value,
                      }))
                    }
                    disabled={!newTransaction.type}
                  >
                    <option value="">Select category</option>

                    {availableCategories.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Transaction Date
                  <input
                    type="date"
                    required
                    value={newTransaction.transactionDate}
                    max={getTodayDate()}
                    onChange={(event) =>
                      setNewTransaction((current) => ({
                        ...current,
                        transactionDate: event.target.value,
                      }))
                    }
                  />
                </label>

                {newTransactionError && (
                  <p className="login-error">{newTransactionError}</p>
                )}

                <div className="transaction-modal-actions">
                  <button
                    type="button"
                    className="action-button"
                    onClick={() => setIsAddModalOpen(false)}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="add-transaction-button"
                    disabled={creating}
                  >
                    {creating ? "Saving..." : "Save Transaction"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
