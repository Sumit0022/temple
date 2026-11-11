"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, Mail } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (data.success) {
        router.push("/admin");
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err: any) {
      setError(err.message || "Failed to connect to authentication service.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#3D0607] flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#E58A13] to-[#F59E0B] flex items-center justify-center mx-auto text-slate-950 font-serif text-3xl font-extrabold shadow-2xl border-2 border-white/40">
          ॐ
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#FDE68A] tracking-tight">
          Temple Administration Portal
        </h1>
        <p className="text-xs text-amber-200/70 max-w-sm mx-auto">
          Authorized Temple Trust Officers, Priests, Auditors, and Operations Staff only.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-[#5C0A0C] py-8 px-6 sm:px-8 rounded-2xl shadow-2xl border border-[#E58A13]/40 space-y-6">
          {error && (
            <div className="p-3 bg-red-900/60 border border-red-500 rounded-xl text-red-200 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-amber-100 mb-1">
                Official Staff Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-amber-300 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-black/30 border border-amber-300/30 rounded-xl text-white outline-none focus:ring-2 focus:ring-[#E58A13]"
                  placeholder="name@mandir.org"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-amber-100 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-amber-300 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-black/30 border border-amber-300/30 rounded-xl text-white outline-none focus:ring-2 focus:ring-[#E58A13]"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-[#E58A13] to-[#F59E0B] text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-98 transition-all flex items-center justify-center space-x-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{loading ? "Authenticating..." : "Access Control Center"}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
