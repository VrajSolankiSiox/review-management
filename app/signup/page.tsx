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
        .login-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background-color: #ecfdf5;
          font-family: system-ui, -apple-system, sans-serif;
          padding: 20px;
        }

        .login-card {
          background: #ffffff;
          padding: 48px 40px;
          border-radius: 28px;
          box-shadow: 0 20px 40px -10px rgba(16, 185, 129, 0.15);
          width: 100%;
          max-width: 440px;
          box-sizing: border-box;
        }

        .login-title {
          color: #064e3b;
          font-size: 28px;
          font-weight: 800;
          text-align: center;
          margin: 0 0 8px 0;
        }

        .login-subtitle {
          color: #059669;
          text-align: center;
          font-size: 15px;
          margin-bottom: 32px;
        }

        .input-group {
          margin-bottom: 20px;
        }

        .input-label {
          display: block;
          color: #065f46;
          font-weight: 600;
          font-size: 14px;
          margin-bottom: 8px;
          margin-left: 4px;
        }

        .input-field {
          width: 100%;
          padding: 15px 18px;
          border: 2px solid #d1fae5;
          border-radius: 20px;
          font-size: 16px;
          color: #064e3b;
          background-color: #f8fafc;
          transition: all 0.2s ease;
          box-sizing: border-box;
          outline: none;
        }

        .input-field::placeholder {
          color: #9ca3af;
        }

        .input-field:focus {
          border-color: #10b981;
          background-color: #ffffff;
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
        }

        .submit-btn {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #34d399 0%, #059669 100%);
          color: white;
          border: none;
          border-radius: 9999px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 8px 20px -6px rgba(5, 150, 105, 0.5);
          margin-top: 8px;
        }

        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px -8px rgba(5, 150, 105, 0.6);
        }

        .submit-btn:active {
          transform: translateY(1px);
        }

        .switch-link {
          display: block;
          text-align: center;
          margin-top: 18px;
          color: #059669;
          font-size: 14px;
          text-decoration: none;
        }

        .switch-link:hover {
          text-decoration: underline;
        }

        .submit-btn:disabled {
          opacity: 0.8;
          cursor: wait;
          transform: none;
          box-shadow: 0 8px 20px -6px rgba(5, 150, 105, 0.5);
        }

        .status-message {
          margin-top: 16px;
          text-align: center;
          font-size: 14px;
          color: #065f46;
        }

        .status-message.error {
          color: #b91c1c;
          font-weight: 600;
        }
      `}</style>

      <div className="login-card">
        <h2 className="login-title">Create Account</h2>
        <p className="login-subtitle">Join us and start reviewing</p>

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
            <p
              className={`status-message ${message.includes("successful") ? "" : "error"}`}
            >
              {message}
            </p>
          ) : null}
        </form>

        <Link href="/login" className="switch-link">
          Already have an account? Sign in
        </Link>
      </div>
    </div>
  );
}
