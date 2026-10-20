"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

export default function DashboardPage() {
  const currentDate = new Date();

  const [year, setYear] = useState(String(currentDate.getFullYear()));
  const [month, setMonth] = useState(String(currentDate.getMonth() + 1));

  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data whenever year or month changes.
  useEffect(() => {
    let cancelled = false;

    async function fetchSummary() {
      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("spendwiseToken");

        if (!token) {
          window.location.href = "/";
          return;
        }

        const params = new URLSearchParams({
          year,
          month,
        });

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/summary?${params}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (response.status === 401) {
          window.location.href = "/";
          return;
        }

        if (!response.ok) {
          throw new Error(
            data.error?.message ||
              data.message ||
              "Failed to load dashboard data.",
          );
        }

        if (!cancelled) {
          setSummary(data.dashboard);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load dashboard data.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchSummary();

    return () => {
      cancelled = true;
    };
  }, [year, month]);

  const formatMoney = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(Number(amount || 0));

  const categories = [
    "Food",
    "Transport",
    "Shopping",
    "Bills",
    "Healthcare",
    "Others",
  ];

  const categoryData = summary?.expensesByCategory || [];

  const totalIncome = Number(summary?.monthly?.income || 0);
  const totalExpenses = Number(summary?.monthly?.expenses || 0);

  const incomeRemaining =
    totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

  const selectedPeriod =
    month === "all"
      ? `Year ${year}`
      : new Date(Number(year), Number(month) - 1).toLocaleString("en-IN", {
          month: "long",
          year: "numeric",
        });

  return (
    <div className="app-layout">
      <Sidebar activePage="Dashboard" />

      <main className="dashboard-content">
        {/* Heading and filters */}
        <div className="dashboard-header">
          <div>
            <h1>Dashboard</h1>
            <p className="dashboard-subtitle">
              Here's an overview of your finances
            </p>
          </div>

          <div className="dashboard-filters">
            <div className="filter-group">
              <label htmlFor="dashboard-year">Year</label>

              <select
                id="dashboard-year"
                value={year}
                onChange={(event) => setYear(event.target.value)}
              >
                {Array.from(
                  { length: 6 },
                  (_, index) => currentDate.getFullYear() - index,
                ).map((itemYear) => (
                  <option key={itemYear} value={itemYear}>
                    {itemYear}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="dashboard-month">Month</label>

              <select
                id="dashboard-month"
                value={month}
                onChange={(event) => setMonth(event.target.value)}
              >
                <option value="all">All Months</option>
                {Array.from({ length: 12 }, (_, index) => index + 1).map(
                  (itemMonth) => (
                    <option key={itemMonth} value={itemMonth}>
                      {new Date(2000, itemMonth - 1).toLocaleString("en-IN", {
                        month: "long",
                      })}
                    </option>
                  ),
                )}
              </select>
            </div>
          </div>
        </div>
        {loading && <p>Loading your financial data...</p>}

        {error && <p className="login-error">{error}</p>}

        {!loading && !error && summary && (
          <>
            {/* Summary cards */}
            <div className="summary-cards">
              <div className="summary-card">
                <p>Net Balance</p>
                <h2>{formatMoney(summary.summary.totalBalance)}</h2>
              </div>

              <div className="summary-card">
                <p>Total Income</p>
                <h2 className="income-amount">
                  {formatMoney(summary.summary.totalIncome)}
                </h2>
              </div>

              <div className="summary-card">
                <p>Total Expenses</p>
                <h2 className="expense-amount">
                  {formatMoney(summary.summary.totalExpenses)}
                </h2>
              </div>
            </div>

            <div className="dashboard-insights">
              {/* Spending by category */}
              <section className="spending-category-card">
                <h2>Spending by Category</h2>

                <p className="insight-subtitle">
                  Expenses for {selectedPeriod}.
                </p>

                {categories.map((category) => {
                  const item = categoryData.find(
                    (entry) =>
                      entry.category.toLowerCase() === category.toLowerCase(),
                  );

                  const amount = Number(item?.totalAmount || 0);

                  const percentage =
                    totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;

                  return (
                    <div className="spending-category-row" key={category}>
                      <div className="spending-category-details">
                        <span>{category}</span>
                        <strong>{percentage.toFixed(2)}%</strong>
                      </div>

                      <div className="spending-progress-track">
                        <div
                          className="spending-progress-fill"
                          style={{
                            width: `${percentage.toFixed(2)}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </section>

              {/* Income remaining */}
              <section className="income-usage-card">
                <h2>Income Remaining</h2>

                <div className="income-usage-content">
                  <strong>{incomeRemaining.toFixed(1)}%</strong>
                  <p>
                    {totalIncome <= 0
                      ? "No income recorded for this period"
                      : incomeRemaining < 0
                        ? "Expenses exceed your income"
                        : "of total income remaining"}
                  </p>
                </div>
              </section>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
