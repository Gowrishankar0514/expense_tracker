"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchSummary() {
      try {
        const token = localStorage.getItem("spendwiseToken");

        if (!token) {
          window.location.href = "/";
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/summary`,
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

        setSummary(data.dashboard);
      } catch (err) {
        setError(err.message || "Unable to load dashboard data.");
      }
    }

    fetchSummary();
  }, []);

  if (error) {
    return (
      <div className="app-layout">
        <Sidebar activePage="Dashboard" />
        <main className="dashboard-content">
          <h1>Dashboard</h1>
          <p className="login-error">{error}</p>
        </main>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="app-layout">
        <Sidebar activePage="Dashboard" />
        <main className="dashboard-content">
          <h1>Dashboard</h1>
          <p>Loading your financial data...</p>
        </main>
      </div>
    );
  }

  const formatMoney = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(Number(amount || 0));

  return (
    <div className="app-layout">
      <Sidebar activePage="Dashboard" />

      <main className="dashboard-content">
        <h1>Dashboard</h1>
        <p className="dashboard-subtitle">
          Here's an overview of your finances
        </p>

        <div className="summary-cards">
          <div className="summary-card">
            <p>Total Balance</p>
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
          <section className="spending-category-card">
            <h2>Spending by Category</h2>
            <p className="insight-subtitle">
              Where your money goes this month.
            </p>

            {(() => {
              const categories = [
                "Food",
                "Transport",
                "Shopping",
                "Bills",
                "Healthcare",
                "Others",
              ];

              const categoryData = summary.expensesByCategory || [];
              const totalExpenses = Number(summary.monthly.expenses || 0);

              return categories.map((category) => {
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
                      <strong>{Math.round(percentage)}%</strong>
                    </div>

                    <div className="spending-progress-track">
                      <div
                        className="spending-progress-fill"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              });
            })()}
          </section>

          <section className="income-usage-card">
            <h2>Income Usage</h2>

            {(() => {
              const income = Number(summary.monthly.income || 0);
              const expenses = Number(summary.monthly.expenses || 0);
              const usage = income > 0 ? (expenses / income) * 100 : 0;

              return (
                <div className="income-usage-content">
                  <strong>{Math.round(usage)}%</strong>
                  <p>
                    of total income
                    <br />
                    spent
                  </p>
                </div>
              );
            })()}
          </section>
        </div>
      </main>
    </div>
  );
}
