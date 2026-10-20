"use client";

import { useState } from "react";
import { Mail, LockKeyhole, Eye, EyeOff } from "lucide-react";

export default function Home() {
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin(event) {
    event.preventDefault();

    setEmailError("");
    setPasswordError("");
    setLoginError("");

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    // Validate email.
    if (typeof email !== "string" || !email.trim()) {
      setEmailError("Email is required.");
    } else if (email.trim().length > 255) {
      setEmailError("Email is too long.");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError("Please enter a valid email address.");
    }

    // Validate password.
    if (typeof password !== "string" || !password) {
      setPasswordError("Password is required.");
    } else if (password.length < 8) {
      setPasswordError("Password must contain at least 8 characters.");
    } else if (password.length > 72) {
      setPasswordError("Password must not exceed 72 characters.");
    } else {
      if (!/[A-Z]/.test(password)) {
        setPasswordError(
          "Password must contain at least one uppercase letter.",
        );
      } else if (!/[^A-Za-z0-9\s]/.test(password)) {
        setPasswordError(
          "Password must contain at least one special character.",
        );
      }
    }

    // Stop if either field is invalid.
    const validEmail =
      typeof email === "string" &&
      email.trim().length > 0 &&
      email.trim().length <= 255 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

    const validPassword =
      typeof password === "string" &&
      password.length >= 8 &&
      password.length <= 72 &&
      /[A-Z]/.test(password) &&
      /[^A-Za-z0-9\s]/.test(password);

    if (!validEmail || !validPassword) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        const details = data.error?.details;

        // Show backend validation errors under their fields.
        if (Array.isArray(details) && details.length > 0) {
          for (const detail of details) {
            if (detail.field === "email") {
              setEmailError(detail.message);
            }

            if (detail.field === "password") {
              setPasswordError(detail.message);
            }
          }
        } else {
          // Keep incorrect credentials as one general error.
          setLoginError(
            data.error?.message ||
              data.message ||
              data.msg ||
              "Login failed. Please try again.",
          );
        }

        return;
      }

      if (!data.token) {
        setLoginError("Login succeeded, but no JWT token was returned.");
        return;
      }

      localStorage.setItem("spendwiseToken", data.token);
      window.location.href = "/dashboard";
    } catch {
      setLoginError("Cannot connect to the server. Please try again.");
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

        <form onSubmit={handleLogin} noValidate>
          <div className="input-with-icon">
            <Mail size={18} className="field-icon" aria-hidden="true" />

            <input
              type="email"
              name="email"
              placeholder="Email*"
              maxLength={255}
              required
              aria-invalid={!!emailError}
              aria-describedby={emailError ? "email-error" : undefined}
              onChange={() => {
                setEmailError("");
                setLoginError("");
              }}
            />
          </div>

          {emailError && (
            <p id="email-error" className="login-error" role="alert">
              {emailError}
            </p>
          )}

          <div className="password-field">
            <LockKeyhole size={18} className="field-icon" aria-hidden="true" />

            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password*"
              maxLength={72}
              required
              aria-invalid={!!passwordError}
              aria-describedby={passwordError ? "password-error" : undefined}
              onChange={() => {
                setPasswordError("");
                setLoginError("");
              }}
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

          {passwordError && (
            <p id="password-error" className="login-error" role="alert">
              {passwordError}
            </p>
          )}

          {loginError && (
            <p className="login-error" role="alert">
              {loginError}
            </p>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="signup-link">
          Don&apos;t have an account?
          <a href="/signup"> Sign Up</a>
        </p>
      </div>
    </main>
  );
}
