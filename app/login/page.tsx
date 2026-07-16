"use client";
import React, { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      localStorage.setItem("JWT", data.token);
      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }
      console.log(data);
      setMessage(data.message || "Login successful");
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
      {/* 
        Including CSS directly here for easy copy-pasting. 
        In a larger app, you would move this to a .css module or use Tailwind/Styled Components.
      */}
      <style>{`
        .login-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background-color: #ecfdf5; /* Soft mint background */
          font-family: system-ui, -apple-system, sans-serif;
          padding: 20px;
        }
        
        .login-card {
          background: #ffffff;
          padding: 48px 40px;
          border-radius: 28px; /* Very curvy card */
          box-shadow: 0 20px 40px -10px rgba(16, 185, 129, 0.15); /* Soft green shadow */
          width: 100%;
          max-width: 400px;
          box-sizing: border-box;
        }

        .login-title {
          color: #064e3b; /* Deep green */
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
          margin-bottom: 24px;
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
          padding: 16px 20px;
          border: 2px solid #d1fae5;
          border-radius: 20px; /* Curvy inputs */
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
          border-color: #10b981; /* Bright green focus ring */
          background-color: #ffffff;
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
        }

        .submit-btn {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #34d399 0%, #059669 100%);
          color: white;
          border: none;
          border-radius: 9999px; /* Fully curvy pill shape */
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

        .status-message.success {
          color: #047857;
          font-weight: 600;
        }

        .status-message.error {
          color: #b91c1c;
          font-weight: 600;
        }
      `}</style>

      <div className="login-card">
        <h2 className="login-title">Welcome Back</h2>
        <p className="login-subtitle">Sign in to your account</p>

        <form onSubmit={handleSubmit}>
          {/* Email Field */}
          <div className="input-group">
            <label htmlFor="email" className="input-label">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>

          {/* Password Field */}
          <div className="input-group">
            <label htmlFor="password" className="input-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          {/* Submit Button */}
          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? "Signing In..." : "Sign In"}
          </button>

          {message ? (
            <p
              className={`status-message ${message.includes("successful") ? "success" : "error"}`}
            >
              {message}
            </p>
          ) : null}
        </form>
      </div>
    </div>
  );
}
