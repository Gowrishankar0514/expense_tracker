"use client";

import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function NewTransactionPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [formValues, setFormValues] = useState({
    title: "",
    amount: "",
    type: "",
    category: "",
    transactionDate: getTodayDate(),
  });

  const [isRestored, setIsRestored] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("spendwiseToken");

    if (!token) {
      window.location.href = "/";
    }
  }, []);

  // Restore saved form data when the page opens

  useEffect(() => {
    const savedForm = localStorage.getItem("spendwiseDraft");

    if (savedForm) {
      try {
        const savedValues = JSON.parse(savedForm);

        setFormValues((current) => ({
          ...current,
          ...savedValues,
          type: "",
        }));
      } catch {
        localStorage.removeItem("spendwiseDraft");
      }
    }

    setIsRestored(true);
  }, []);

  // Save form data whenever a field changes
  useEffect(() => {
    if (isRestored) {
      localStorage.setItem(
        "spendwiseDraft",
        JSON.stringify({
          ...formValues,
          type: "",
        }),
      );
    }
  }, [formValues, isRestored]);

  async function handleSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    setError("");
    const token = localStorage.getItem("spendwiseToken");

    if (!token) {
      window.location.href = "/";
      return;
    }
    setLoading(true);

    const transaction = {
      title: formData.get("title"),
      amount: Number(formData.get("amount")),
      type: formData.get("type"),
      category: formData.get("category"),
      transactionDate: formData.get("transactionDate"),
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/transactions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(transaction),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error?.message || data.message || "Unable to save transaction.",
        );
      }

      setFormValues({
        title: "",
        amount: "",
        type: "",
        category: "",
        transactionDate: getTodayDate(),
      });

      localStorage.removeItem("spendwiseDraft");
      setError("");
    } catch (err) {
      setError(err.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-layout">
      <Sidebar activePage="Transactions" />

      <main className="dashboard-content">
        <div className="transactions-header">
          <div>
            <h1>Add Transaction</h1>
            <p className="dashboard-subtitle">Record your income or expenses</p>
          </div>

          <a className="back-to-transactions" href="/transactions">
            ← Back to Transactions
          </a>
        </div>

        <section className="add-transaction-card">
          <form className="transaction-form" onSubmit={handleSubmit}>
            <label htmlFor="title">Transaction Title *</label>
            <input
              id="title"
              name="title"
              type="text"
              placeholder="Enter transaction title"
              maxLength={150}
              value={formValues.title}
              onChange={(event) =>
                setFormValues({
                  ...formValues,
                  title: event.target.value,
                })
              }
              required
            />

            <div className="transaction-form-grid">
              <div className="transaction-form-field">
                <label htmlFor="amount">Amount (₹) *</label>
                <input
                  id="amount"
                  name="amount"
                  type="text"
                  inputMode="decimal"
                  placeholder="Enter amount"
                  value={formValues.amount}
                  onKeyDown={(event) => {
                    if (["e", "E", "+", "-"].includes(event.key)) {
                      event.preventDefault();
                    }
                  }}
                  onChange={(event) => {
                    const value = event.target.value;

                    if (/^\d*\.?\d{0,2}$/.test(value)) {
                      setFormValues((current) => ({
                        ...current,
                        amount: value,
                      }));
                    }
                  }}
                  required
                />
              </div>

              <div className="transaction-form-field">
                <label htmlFor="type">Transaction Type *</label>

                <select
                  id="type"
                  name="type"
                  value={formValues.type}
                  onChange={(event) =>
                    setFormValues((current) => ({
                      ...current,
                      type: event.target.value,
                    }))
                  }
                  required
                >
                  <option value="" disabled>
                    Select type
                  </option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
            </div>

            <div className="transaction-form-grid">
              <div className="transaction-form-field">
                <label htmlFor="category">Category *</label>

                <select
                  id="category"
                  name="category"
                  value={formValues.category}
                  onChange={(event) =>
                    setFormValues((current) => ({
                      ...current,
                      category: event.target.value,
                    }))
                  }
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
              </div>

              <div className="transaction-form-field">
                <label htmlFor="transactionDate">Transaction Date *</label>
                <input
                  id="transactionDate"
                  name="transactionDate"
                  type="date"
                  value={formValues.transactionDate}
                  onChange={(event) =>
                    setFormValues((current) => ({
                      ...current,
                      transactionDate: event.target.value,
                    }))
                  }
                  required
                />
              </div>
            </div>

            {error && <p className="login-error">{error}</p>}

            <div className="transaction-form-actions">
              <a className="cancel-transaction-button" href="/transactions">
                Cancel
              </a>

              <button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Transaction"}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
