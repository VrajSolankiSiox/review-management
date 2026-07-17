"use client";
import Link from "next/link";
import React, { useState } from "react";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");

    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Signup failed");
      }

      setMessage(data.message || "Signup successful");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <style>{`
        /* Core Reset & Font */
        .login-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background-color: #f8fafc; /* Very light gray/blue matching the app background */
          font-family: system-ui, -apple-system, sans-serif;
          padding: 20px;
        }

        /* Card Styling */
        .login-card {
          background: #ffffff;
          padding: 40px;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          width: 100%;
          max-width: 420px;
          box-sizing: border-box;
        }

        /* Typography */
        .login-title {
          color: #111827; /* Dark slate for high contrast */
          font-size: 32px;
          font-weight: 800;
          text-align: left;
          margin: 0 0 8px 0;
          letter-spacing: -0.025em;
        }

        .login-subtitle {
          color: #6b7280; /* Subtle gray matching the reference description text */
          text-align: left;
          font-size: 15px;
          margin-bottom: 32px;
          line-height: 1.5;
        }

        /* Form Layout */
        .input-group {
          margin-bottom: 20px;
        }

        .input-label {
          display: block;
          color: #374151;
          font-weight: 600;
          font-size: 14px;
          margin-bottom: 6px;
        }

        /* Input Fields */
        .input-field {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #d1d5db;
          border-radius: 8px; 
          font-size: 15px;
          color: #111827;
          background-color: #ffffff;
          transition: all 0.2s ease;
          box-sizing: border-box;
          outline: none;
        }

        .input-field::placeholder {
          color: #9ca3af;
        }

        .input-field:focus {
          border-color: #059669; /* Brand Green */
          box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.15);
        }

        /* Submit Button */
        .submit-btn {
          width: 100%;
          padding: 12px 16px;
          background-color: #008751; /* Darker brand green matching the dashboard image */
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s ease;
          margin-top: 8px;
        }

        .submit-btn:hover {
          background-color: #007043;
        }

        .submit-btn:active {
          transform: translateY(1px);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        /* Helper Links */
        .switch-link {
          display: block;
          text-align: center;
          margin-top: 24px;
          color: #008751;
          font-size: 14px;
          font-weight: 500;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .switch-link:hover {
          color: #007043;
          text-decoration: underline;
        }

        /* Status Messages */
        .status-message {
          margin-top: 16px;
          text-align: center;
          font-size: 14px;
          padding: 12px;
          border-radius: 6px;
        }

        .status-message.success {
          background-color: #ecfdf5;
          color: #047857;
          border: 1px solid #a7f3d0;
        }

        .status-message.error {
          background-color: #fef2f2;
          color: #b91c1c;
          border: 1px solid #fecaca;
        }
      `}</style>

      <div className="login-card">
        <h2 className="login-title">Create Account</h2>
        <p className="login-subtitle">
          Join us and start managing your reviews effectively.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="fullName" className="input-label">
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              className="input-field"
              value={formData.fullName}
              onChange={handleChange}
              required
              placeholder="Jane Doe"
            />
          </div>

          <div className="input-group">
            <label htmlFor="email" className="input-label">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="input-field"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
            />
          </div>

          <div className="input-group">
            <label htmlFor="password" className="input-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="input-field"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
            />
          </div>

          <div className="input-group">
            <label htmlFor="confirmPassword" className="input-label">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className="input-field"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Sign Up"}
          </button>

          {message ? (
            <div
              className={`status-message ${message.toLowerCase().includes("successful") ? "success" : "error"}`}
            >
              {message}
            </div>
          ) : null}
        </form>

        <Link href="/login" className="switch-link">
          Already have an account? Sign in
        </Link>
      </div>
    </div>
  );
}
