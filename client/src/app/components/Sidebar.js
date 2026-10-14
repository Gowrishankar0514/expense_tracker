"use client";

import { useState } from "react";
export default function Sidebar({ activePage }) {
  const [error, setError] = useState("");

  async function handleLogout() {
    const confirmed = window.confirm("Are you sure you want to logout?");

    if (!confirmed) {
      return;
    }

    setError("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`,
        {
          method: "POST",
          credentials: "include",
        },
      );

      if (!response.ok) {
        setError("Logout failed. Please try again.");
        return;
      }

      window.location.href = "/";
    } catch {
      setError("Cannot connect to the server.");
    }
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h2>SpendWise</h2>
        <p>Track. Manage. Grow.</p>
      </div>

      <nav className="sidebar-menu">
        <a
          href="/dashboard"
          className={activePage === "Dashboard" ? "active" : ""}
        >
          Dashboard
        </a>

        <a
          href="/transactions"
          className={activePage === "Transactions" ? "active" : ""}
        >
          Transactions
        </a>

        <a href="/profile" className={activePage === "Profile" ? "active" : ""}>
          Profile
        </a>

        <button type="button" className="logout-link" onClick={handleLogout}>
          Logout
        </button>

        {error && <p className="login-error">{error}</p>}
      </nav>
    </aside>
  );
}
