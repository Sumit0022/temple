"use client";

import React, { useState, useEffect } from "react";
import { generateSevaPassPDF } from "@/lib/receipt";
import {
  Flame,
  Calendar,
  Clock,
  User,
  Users,
  Download,
  Plus,
  ShieldCheck,
  CheckCircle2,
  X,
} from "lucide-react";

export default function AdminSevasPage() {
  const [activeTab, setActiveTab] = useState<"roster" | "catalog">("roster");
  const [bookings, setBookings] = useState<any[]>([]);
  const [sevas, setSevas] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [dateFilter, setDateFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // New Seva modal
  const [modalOpen, setModalOpen] = useState(false);
  const [sevaName, setSevaName] = useState("");
  const [sevaNameHi, setSevaNameHi] = useState("");
  const [sevaCatId, setSevaCatId] = useState("");
  const [sevaCode, setSevaCode] = useState("");
  const [sevaPrice, setSevaPrice] = useState("");
  const [sevaDeity, setSevaDeity] = useState("");
  const [sevaDuration, setSevaDuration] = useState("");
  const [sevaMaxPerDay, setSevaMaxPerDay] = useState("");
  const [sevaTimings, setSevaTimings] = useState("");
  const [sevaDesc, setSevaDesc] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchRoster = async () => {
    setLoading(true);
    try {
      const q = dateFilter ? `?date=${encodeURIComponent(dateFilter)}` : "";
      const res = await fetch(`/api/sevas/bookings${q}`);
      const data = await res.json();
      if (Array.isArray(data)) setBookings(data);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const fetchSevas = async () => {
    try {
      const res = await fetch("/api/sevas");
      const data = await res.json();
      if (data.sevas) setSevas(data.sevas);
      if (data.categories) {
        setCategories(data.categories);
        if (data.categories.length > 0) setSevaCatId(data.categories[0].id);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchSevas();
  }, []);

  useEffect(() => {
    fetchRoster();
  }, [dateFilter]);

  const handleCreateSeva = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sevaName || !sevaCatId || !sevaPrice || !sevaCode) {
      alert("Please fill required fields.");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/sevas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: sevaName,
          nameHi: sevaNameHi || sevaName,
          categoryId: sevaCatId,
          code: sevaCode,
          price: sevaPrice,
          deityName: sevaDeity,
          durationMinutes: sevaDuration,
          maxBookingsPerDay: sevaMaxPerDay,
          timings: sevaTimings,
          description: sevaDesc,
          isFeatured: true,
        }),
      });

      if (res.ok) {
        alert("Seva added to roster!");
        setModalOpen(false);
        setSevaName("");
        setSevaCode("");
        fetchSevas();
      } else {
        const d = await res.json();
        alert(d.error || "Failed to create seva");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setCreating(false);
    }
  };

  const downloadPass = (b: any) => {
    const doc = generateSevaPassPDF({
      bookingNumber: b.bookingNumber,
      devoteeName: b.devoteeName,
      devoteePhone: b.devoteePhone,
      gotra: b.gotra,
      nakshatra: b.nakshatra,
      sankalpa: b.sankalpa,
      familyMembers: b.familyMembers,
      sevaName: b.seva?.name || "Seva",
      deityName: b.seva?.deityName || "Deity",
      bookingDate: new Date(b.bookingDate).toLocaleDateString("en-IN"),
      timeSlot: b.bookingTimeSlot,
      numberOfPeople: b.numberOfPeople,
      amountPaid: b.totalAmount,
    });
    doc.save(`Mandir_Pass_${b.bookingNumber}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold text-[#E58A13] uppercase tracking-wider">
            Vedic Rituals & Sanctum Scheduling
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#7B1113]">
            Puja Seva Roster & Slots Administration
          </h1>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-[#7B1113] hover:bg-[#9B1C1E] text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Sacred Seva</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-2">
        <button
          onClick={() => setActiveTab("roster")}
          className={`px-5 py-2.5 font-serif font-bold text-xs border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === "roster"
              ? "border-[#7B1113] text-[#7B1113]"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Priest (Pujari) Daily Sankalpa Roster</span>
        </button>

        <button
          onClick={() => setActiveTab("catalog")}
          className={`px-5 py-2.5 font-serif font-bold text-xs border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === "catalog"
              ? "border-[#7B1113] text-[#7B1113]"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>Seva Configurations & Quotas ({sevas.length})</span>
        </button>
      </div>

      {/* TAB 1: DAILY ROSTER FOR PRIESTS */}
      {activeTab === "roster" && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-700">Filter Schedule by Date:</span>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg outline-none font-bold text-[#7B1113]"
              />
              {dateFilter && (
                <button
                  type="button"
                  onClick={() => setDateFilter("")}
                  className="px-2 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-semibold transition-colors"
                >
                  Clear (Show All)
                </button>
              )}
            </div>

            <span className="font-semibold text-slate-500">
              {bookings.length} Seva(s) scheduled {dateFilter ? `for ${dateFilter}` : "(All Recorded)"}
            </span>
          </div>

          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Pass No</th>
                    <th className="py-3 px-4">Time Slot</th>
                    <th className="py-3 px-4">Sacred Seva</th>
                    <th className="py-3 px-4">Yajaman (Devotee)</th>
                    <th className="py-3 px-4">Gotra / Nakshatra</th>
                    <th className="py-3 px-4">Sankalpa Particulars</th>
                    <th className="py-3 px-4">People</th>
                    <th className="py-3 px-4 text-right">Pass</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookings.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500">
                        No seva bookings for the selected date.
                      </td>
                    </tr>
                  ) : (
                    bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-amber-50/30 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-[#7B1113]">
                          {b.bookingNumber}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                          {b.bookingTimeSlot}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {b.seva?.name}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-800 block">{b.devoteeName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{b.devoteePhone}</span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {b.gotra || "Swagotra"} {b.nakshatra && `(${b.nakshatra})`}
                        </td>
                        <td className="py-3.5 px-4 max-w-xs text-slate-700">
                          <p className="line-clamp-2">{b.sankalpa || "Loka Kalyana"}</p>
                          {b.familyMembers && (
                            <span className="text-[10px] text-slate-400 block mt-0.5 truncate">
                              Family: {b.familyMembers}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 font-semibold">
                          {b.numberOfPeople} Person(s)
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => downloadPass(b)}
                            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-[#7B1113] font-bold rounded-lg text-[11px] border border-amber-200 inline-flex items-center space-x-1"
                          >
                            <Download className="w-3 h-3" />
                            <span>PDF</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SEVA CONFIGURATIONS */}
      {activeTab === "catalog" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sevas.map((s) => (
            <div key={s.id} className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-[#E58A13] bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  {s.category?.name}
                </span>
                <span className="font-serif font-bold text-lg text-[#7B1113]">
                  ₹{s.price.toLocaleString("en-IN")}
                </span>
              </div>

              <h3 className="font-serif font-bold text-base text-slate-900">{s.name}</h3>
              <p className="text-xs text-slate-500 line-clamp-2">{s.description}</p>

              <div className="pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span>Deity:</span>
                  <span className="font-semibold text-slate-800">{s.deityName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span>{s.durationMinutes} mins</span>
                </div>
                <div className="flex justify-between">
                  <span>Max Daily Quota:</span>
                  <span className="font-bold text-slate-800">{s.maxBookingsPerDay} slots</span>
                </div>
                <div className="flex justify-between">
                  <span>Timings:</span>
                  <span className="font-mono text-[11px] text-[#7B1113]">{s.timings}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Seva Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 relative shadow-2xl border border-amber-300 max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-slate-100 text-slate-500"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="font-serif font-bold text-xl text-[#7B1113] border-b pb-3 mb-4">
              Add New Sacred Seva to Temple Calendar
            </h2>

            <form onSubmit={handleCreateSeva} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Seva Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maharudrabhishek"
                    value={sevaName}
                    onChange={(e) => setSevaName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#E58A13]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hindi Title</label>
                  <input
                    type="text"
                    placeholder="e.g. महारुद्राभिषेक"
                    value={sevaNameHi}
                    onChange={(e) => setSevaNameHi(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#E58A13]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={sevaCatId}
                    onChange={(e) => setSevaCatId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Seva Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="SEVA-RUDRABHISHEK-01"
                    value={sevaCode}
                    onChange={(e) => setSevaCode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg uppercase outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Dakshina (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="2500"
                    value={sevaPrice}
                    onChange={(e) => setSevaPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    value={sevaDuration}
                    onChange={(e) => setSevaDuration(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Max Quota/Day *</label>
                  <input
                    type="number"
                    value={sevaMaxPerDay}
                    onChange={(e) => setSevaMaxPerDay(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Timings (Comma separated) *</label>
                <input
                  type="text"
                  required
                  placeholder="07:00 AM, 09:30 AM, 04:00 PM"
                  value={sevaTimings}
                  onChange={(e) => setSevaTimings(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description & Ritual Benefits</label>
                <textarea
                  rows={2}
                  placeholder="Vedic mantras chanted, flowers, panchamrit..."
                  value={sevaDesc}
                  onChange={(e) => setSevaDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div className="pt-3 border-t">
                <button
                  type="submit"
                  disabled={creating}
                  className="w-full py-3 bg-[#7B1113] hover:bg-[#9B1C1E] text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow"
                >
                  {creating ? "Adding Seva..." : "Save Sacred Seva"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
