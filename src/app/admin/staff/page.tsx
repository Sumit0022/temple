"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  ShieldCheck,
  Plus,
  UserCheck,
  UserX,
  X,
  Mail,
  Phone,
  Lock,
} from "lucide-react";

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("DONATION_MANAGER");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchStaff = async () => {
    try {
      const res = await fetch("/api/staff");
      const data = await res.json();
      if (Array.isArray(data)) setStaff(data);
    } catch (e) {}
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role, phone }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Staff account created successfully!");
        setModalOpen(false);
        setName("");
        setEmail("");
        setPassword("");
        fetchStaff();
      } else {
        alert(data.error || "Failed to create staff");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/staff", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !currentStatus }),
      });
      if (res.ok) {
        setStaff((prev) =>
          prev.map((s) => (s.id === id ? { ...s, isActive: !currentStatus } : s))
        );
      }
    } catch (err) {
      alert("Failed to update status");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold text-[#E58A13] uppercase tracking-wider">
            Access Control & RBAC
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#7B1113]">
            Temple Staff Accounts & Permissions
          </h1>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-[#7B1113] hover:bg-[#9B1C1E] text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Staff Account</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Access Role</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staff.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {s.name}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-mono">
                    {s.email}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 font-mono">
                      {s.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {s.phone || "N/A"}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        s.isActive ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {s.isActive ? "Active" : "Deactivated"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => toggleStatus(s.id, s.isActive)}
                      className={`px-3 py-1 rounded-lg text-[11px] font-bold ${
                        s.isActive
                          ? "bg-red-50 text-red-600 hover:bg-red-100"
                          : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                      }`}
                    >
                      {s.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 relative shadow-2xl border border-amber-300">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-slate-100 text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="font-serif font-bold text-lg text-[#7B1113] border-b pb-2 mb-4">
              Add New Staff Account & Assign Role
            </h2>

            <form onSubmit={handleCreateStaff} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pandit Keshav Shastri"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official Email *</label>
                <input
                  type="email"
                  required
                  placeholder="keshav@mandir.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Role *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg outline-none bg-white font-mono"
                >
                  <option value="TEMPLE_ADMIN">TEMPLE_ADMIN (General Administrator)</option>
                  <option value="ACCOUNTANT">ACCOUNTANT (Financials & Audit)</option>
                  <option value="DONATION_MANAGER">DONATION_MANAGER (Donations & 80G)</option>
                  <option value="STORE_MANAGER">STORE_MANAGER (Prasad & Orders)</option>
                  <option value="INVENTORY_MANAGER">INVENTORY_MANAGER (Bhandar Supplies)</option>
                  <option value="SEVA_MANAGER">SEVA_MANAGER (Priest & Seva Scheduling)</option>
                  <option value="EVENT_MANAGER">EVENT_MANAGER (Content & Festivals)</option>
                  <option value="GENERAL_STAFF">GENERAL_STAFF (Front Desk Inquiries)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mobile Phone</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 00000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Set Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#7B1113] text-white font-bold rounded-xl uppercase tracking-wider"
              >
                {loading ? "Creating..." : "Create Account"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
