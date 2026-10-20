"use client";

import { useState } from "react";
import { UserRound, Mail, LockKeyhole, Eye, EyeOff } from "lucide-react";

export default function SignupPage() {
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function handleSignup(event) {
    event.preventDefault();

    setNameError("");
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setError("");

    const formData = new FormData(event.currentTarget);

    const name = formData.get("name");
    const email = formData.get("email");
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    let hasError = false;

    // Validate name.
    if (typeof name !== "string" || !name.trim()) {
      setNameError("Full name is required.");
      hasError = true;
    } else if (name.trim().length > 75) {
      setNameError("Name must not exceed 75 characters.");
      hasError = true;
    }

    // Validate email.
    if (typeof email !== "string" || !email.trim()) {
      setEmailError("Email is required.");
      hasError = true;
    } else if (email.trim().length > 75) {
      setEmailError("Email must not exceed 75 characters.");
      hasError = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError("Please enter a valid email address.");
      hasError = true;
    }

    // Validate password.
    if (typeof password !== "string" || !password) {
      setPasswordError("Password is required.");
      hasError = true;
    } else if (password.length < 8) {
      setPasswordError("Password must contain at least 8 characters.");
      hasError = true;
    } else if (password.length > 72) {
      setPasswordError("Password must not exceed 72 characters.");
      hasError = true;
    } else if (!/[A-Z]/.test(password)) {
      setPasswordError("Password must contain at least one uppercase letter.");
      hasError = true;
    } else if (!/[^A-Za-z0-9\s]/.test(password)) {
      setPasswordError("Password must contain at least one special character.");
      hasError = true;
    }

    // Validate confirm password.
    if (typeof confirmPassword !== "string" || !confirmPassword) {
      setConfirmPasswordError("Please confirm your password.");
      hasError = true;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match.");
      hasError = true;
    }

    if (hasError) {
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
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        const details = data.error?.details;

        // Display backend validation errors beside their fields.
        if (Array.isArray(details) && details.length > 0) {
          for (const detail of details) {
            if (detail.field === "name") {
              setNameError(detail.message);
            } else if (detail.field === "email") {
              setEmailError(detail.message);
            } else if (detail.field === "password") {
              setPasswordError(detail.message);
            }
          }
        } else if (
          data.error?.code === "EMAIL_ALREADY_EXISTS" ||
          data.code === "EMAIL_ALREADY_EXISTS"
        ) {
          setEmailError(
            data.error?.message ||
              data.message ||
              "An account with this email already exists.",
          );
        } else {
          setError(
            data.error?.message ||
              data.message ||
              data.msg ||
              "Registration failed. Please try again.",
          );
        }

        return;
      }

      window.location.href = "/";
    } catch {
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

        <form onSubmit={handleSignup} noValidate>
          <div className="signup-input-field">
            <UserRound size={18} className="field-icon" aria-hidden="true" />
            <input
              type="text"
              name="name"
              placeholder="Full Name*"
              maxLength={75}
              required
              aria-invalid={!!nameError}
              aria-describedby={nameError ? "name-error" : undefined}
              onChange={() => {
                setNameError("");
                setError("");
              }}
            />
          </div>

          {nameError && (
            <p id="name-error" className="login-error" role="alert">
              {nameError}
            </p>
          )}

          <div className="signup-input-field">
            <Mail size={18} className="field-icon" aria-hidden="true" />
            <input
              type="email"
              name="email"
              placeholder="Email*"
              maxLength={75}
              required
              aria-invalid={!!emailError}
              aria-describedby={emailError ? "signup-email-error" : undefined}
              onChange={() => {
                setEmailError("");
                setError("");
              }}
            />
          </div>

          {emailError && (
            <p id="signup-email-error" className="login-error" role="alert">
              {emailError}
            </p>
          )}

          <div className="signup-input-field">
            <LockKeyhole size={18} className="field-icon" aria-hidden="true" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password*"
              minLength={8}
              maxLength={72}
              required
              aria-invalid={!!passwordError}
              aria-describedby={
                passwordError ? "signup-password-error" : undefined
              }
              onChange={() => {
                setPasswordError("");
                setError("");
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
            <p id="signup-password-error" className="login-error" role="alert">
              {passwordError}
            </p>
          )}

          <div className="signup-input-field">
            <LockKeyhole size={18} className="field-icon" aria-hidden="true" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password*"
              minLength={8}
              maxLength={72}
              required
              aria-invalid={!!confirmPasswordError}
              aria-describedby={
                confirmPasswordError ? "confirm-password-error" : undefined
              }
              onChange={() => {
                setConfirmPasswordError("");
                setError("");
              }}
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

          {confirmPasswordError && (
            <p id="confirm-password-error" className="login-error" role="alert">
              {confirmPasswordError}
            </p>
          )}

          {error && (
            <p className="login-error" role="alert">
              {error}
            </p>
          )}

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
