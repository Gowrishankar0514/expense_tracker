"use client";

import { useState } from "react";

export default function Home() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event) {
    event.preventDefault();

    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);

    const email = formData.get("email");
    const password = formData.get("password");
    if (typeof password !== "string" || !password) {
      setError("Password is required.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || data.msg || "Login failed. Check your details.",
        );
        return;
      }

      window.location.href = "/dashboard";
    } catch (err) {
      setError("Cannot connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <div className="login-card">
        <div className="logo">
          <h2>SpendWise</h2>
          <p>Track. Manage. Grow.</p>
        </div>

        <h1>Welcome Back!</h1>
        <p className="subtitle">Sign in to your SpendWise account</p>

        <form onSubmit={handleLogin}>
          <input type="email" name="email" placeholder="✉   Email*" required />

          <input
            type="password"
            name="password"
            placeholder="▣   Password*"
            required
          />

          <div className="forgot-password">
            <a href="/forgot-password">Forgot Password?</a>
          </div>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="signup-link">
          Don't have an account?
          <a href="/signup"> Sign Up</a>
        </p>
      </div>
    </main>
  );
}
