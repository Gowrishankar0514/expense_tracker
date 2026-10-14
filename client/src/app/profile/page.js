"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const token = localStorage.getItem("spendwiseToken");

      if (!token) {
        window.location.href = "/";
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.status === 401) {
          window.location.href = "/";
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error?.message ||
              data.message ||
              "Unable to load your profile.",
          );
        }

        setUser(data.user);
      } catch (err) {
        setError(err.message || "Unable to connect to the server.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  return (
    <div className="app-layout">
      <Sidebar activePage="Profile" />

      <main className="dashboard-content">
        <h1>My Profile</h1>
        <p className="dashboard-subtitle">
          View your SpendWise account information
        </p>

        <section className="profile-card">
          {loading ? (
            <p>Loading your profile...</p>
          ) : error ? (
            <p className="login-error">{error}</p>
          ) : user ? (
            <>
              <div className="profile-avatar">
                {(user.name || user.email || "U").charAt(0).toUpperCase()}
              </div>

              <h2 className="profile-name">{user.name || "User"}</h2>

              <p className="profile-description">SpendWise Account</p>

              <div className="profile-details">
                <div className="profile-detail">
                  <span>Full Name</span>
                  <strong>{user.name || "Not available"}</strong>
                </div>

                <div className="profile-detail">
                  <span>Email Address</span>
                  <strong>{user.email || "Not available"}</strong>
                </div>
              </div>
            </>
          ) : (
            <p>Profile information is unavailable.</p>
          )}
        </section>
      </main>
    </div>
  );
}
