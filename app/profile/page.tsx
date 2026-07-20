"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Lock,
  User as UserIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();

  // Profile State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [profileMessage, setProfileMessage] = useState({ text: "", type: "" });
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState({
    text: "",
    type: "",
  });
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  useEffect(() => {
    try {
      const token = localStorage.getItem("JWT");
      if (token) {
        const payloadBase64 = token.split(".")[1];
        const decodedPayload = JSON.parse(atob(payloadBase64));
        const fullName = decodedPayload.full_name || "";
        const parts = fullName.trim().split(" ");
        setFirstName(parts[0] || "");
        setLastName(parts.length > 1 ? parts.slice(1).join(" ") : "");
        setEmail(decodedPayload.user || "");
      } else {
        router.push("/login");
      }
    } catch (e) {
      console.error("Failed to parse JWT in profile");
      router.push("/login");
    }
  }, [router]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage({ text: "", type: "" });
    setIsProfileLoading(true);

    try {
      const token = localStorage.getItem("JWT");
      const res = await fetch("/api/user/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ firstName, lastName }),
      });

      const data = await res.json();

      if (res.ok) {
        setProfileMessage({
          text: "Profile updated successfully!",
          type: "success",
        });
        localStorage.setItem("JWT", data.token); // Save new token
        window.dispatchEvent(new Event("jwt-updated")); // Update sidebar
      } else {
        setProfileMessage({
          text: data.error || "Failed to update profile.",
          type: "error",
        });
      }
    } catch (error) {
      setProfileMessage({
        text: "An error occurred. Please try again.",
        type: "error",
      });
    } finally {
      setIsProfileLoading(false);
      // Auto-hide success message
      setTimeout(() => setProfileMessage({ text: "", type: "" }), 3000);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage({ text: "", type: "" });

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ text: "New passwords do not match", type: "error" });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage({
        text: "New password must be at least 6 characters",
        type: "error",
      });
      return;
    }

    setIsPasswordLoading(true);

    try {
      const token = localStorage.getItem("JWT");
      const res = await fetch("/api/user/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setPasswordMessage({
          text: "Password updated successfully!",
          type: "success",
        });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordMessage({
          text: data.error || "Failed to update password.",
          type: "error",
        });
      }
    } catch (error) {
      setPasswordMessage({
        text: "An error occurred. Please try again.",
        type: "error",
      });
    } finally {
      setIsPasswordLoading(false);
      setTimeout(() => setPasswordMessage({ text: "", type: "" }), 3000);
    }
  };

  if (!email) return null; // Loading state

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 text-slate-900">
      <div className="  max-w-7xl space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Profile Settings
            </h1>
            <p className="text-slate-500 mt-2">
              Manage your personal information and security preferences.
            </p>
          </div>
        </div>

        <div className="space-y-8 max-w-4xl">
          {/* Personal Information Form */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50 flex items-center gap-3">
              <div className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg shadow-sm">
                <UserIcon size={18} />
              </div>
              <h2 className="font-semibold text-lg text-slate-900">
                Personal Information
              </h2>
            </div>

            <form
              onSubmit={handleProfileUpdate}
              className="p-6 md:p-8 space-y-6"
            >
              {profileMessage.text && (
                <div
                  className={`p-4 rounded-xl text-sm font-medium flex items-center gap-3 ${
                    profileMessage.type === "error"
                      ? "bg-red-50 text-red-700 border border-red-100"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                  }`}
                >
                  {profileMessage.type === "error" ? (
                    <AlertCircle size={18} />
                  ) : (
                    <CheckCircle2 size={18} />
                  )}
                  {profileMessage.text}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2 group">
                  <label className="text-sm font-semibold text-slate-700">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 outline-none focus:border-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-400 transition-all"
                    placeholder="e.g. Jane"
                  />
                </div>
                <div className="space-y-2 group">
                  <label className="text-sm font-semibold text-slate-700">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 outline-none focus:border-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-400 transition-all"
                    placeholder="e.g. Doe"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Email Address (Non-editable)
                </label>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-slate-500 cursor-not-allowed"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isProfileLoading}
                  className="flex items-center gap-2 rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isProfileLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  {isProfileLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>

          {/* Security Form */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50 flex items-center gap-3">
              <div className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg shadow-sm">
                <Lock size={18} />
              </div>
              <h2 className="font-semibold text-lg text-slate-900">
                Security & Password
              </h2>
            </div>

            <form
              onSubmit={handlePasswordReset}
              className="p-6 md:p-8 space-y-6"
            >
              {passwordMessage.text && (
                <div
                  className={`p-4 rounded-xl text-sm font-medium flex items-center gap-3 ${
                    passwordMessage.type === "error"
                      ? "bg-red-50 text-red-700 border border-red-100"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                  }`}
                >
                  {passwordMessage.type === "error" ? (
                    <AlertCircle size={18} />
                  ) : (
                    <CheckCircle2 size={18} />
                  )}
                  {passwordMessage.text}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 outline-none focus:border-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-400 transition-all"
                  placeholder="••••••••"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 outline-none focus:border-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-400 transition-all"
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 outline-none focus:border-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-400 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isPasswordLoading}
                  className="flex items-center gap-2 rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isPasswordLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Lock size={16} />
                  )}
                  {isPasswordLoading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
