"use client";

import { useState } from "react";
import { UserRound, Mail, LockKeyhole, Eye, EyeOff } from "lucide-react";

export default function SignupPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function handleSignup(event) {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);

    const name = formData.get("name");
    const email = formData.get("email");
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    if (typeof password !== "string" || password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setError("Password must contain at least one uppercase letter.");
      return;
    }

    if (!/[^A-Za-z0-9\s]/.test(password)) {
      setError("Password must contain at least one special character.");
      return;
    }

    if (password.length > 72) {
      setError("Password must not exceed 72 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ name, email, password }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || data.msg || "Registration failed. Please try again.",
        );
        return;
      }

      window.location.href = "/";
    } catch (err) {
      setError("Cannot connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page" id="signup-page">
      <div className="login-card signup-card">
        <div className="logo">
          <h2>SpendWise</h2>
          <p>Track. Manage. Grow.</p>
        </div>

        <h1>Create Account</h1>
        <p className="subtitle">
          Join SpendWise and take control of your money
        </p>

        <form onSubmit={handleSignup}>
          <div className="signup-input-field">
            <UserRound size={18} className="field-icon" aria-hidden="true" />
            <input
              type="text"
              name="name"
              placeholder="Full Name*"
              maxLength={75}
              required
            />
          </div>

          <div className="signup-input-field">
            <Mail size={18} className="field-icon" aria-hidden="true" />
            <input
              type="email"
              name="email"
              placeholder="Email*"
              maxLength={75}
              required
            />
          </div>

          <div className="signup-input-field">
            <LockKeyhole size={18} className="field-icon" aria-hidden="true" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password*"
              minLength={8}
              maxLength={72}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="signup-input-field">
            <LockKeyhole size={18} className="field-icon" aria-hidden="true" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password*"
              minLength={8}
              maxLength={72}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={
                showConfirmPassword
                  ? "Hide confirm password"
                  : "Show confirm password"
              }
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {error && <p className="login-error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className="signup-link">
          Already have an account?
          <a href="/"> Sign In</a>
        </p>
      </div>
    </main>
  );
}
