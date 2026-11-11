"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/lib/language-context";
import { generateDonationReceiptPDF, generateSevaPassPDF } from "@/lib/receipt";
import Link from "next/link";
import {
  User,
  Heart,
  ShoppingBag,
  Flame,
  Download,
  LogOut,
  CheckCircle2,
  Clock,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Calendar,
} from "lucide-react";

export default function DevoteePortalPage() {
  const { lang, t } = useLanguage();

  const [devotee, setDevotee] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"donations" | "orders" | "sevas">("donations");

  // Auth form states
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [identifier, setIdentifier] = useState<string>("");
  const [loginPassword, setLoginPassword] = useState<string>("");
  const [regName, setRegName] = useState<string>("");
  const [regPhone, setRegPhone] = useState<string>("");
  const [regEmail, setRegEmail] = useState<string>("");
  const [regPassword, setRegPassword] = useState<string>("");
  const [regGotra, setRegGotra] = useState<string>("");
  const [regPan, setRegPan] = useState<string>("");

  // History states
  const [myDonations, setMyDonations] = useState<any[]>([]);
  const [myOrders, setMyOrders] = useState<any[]>([]);
  const [mySevas, setMySevas] = useState<any[]>([]);

  const fetchSession = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.devotee) {
        setDevotee(data.devotee);
        loadDevoteeData();
      } else {
        setDevotee(null);
      }
    } catch (e) {
      setDevotee(null);
    } finally {
      setLoading(false);
    }
  };

  const loadDevoteeData = async () => {
    // Load my donations
    fetch("/api/donations?my=true")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) setMyDonations(d);
      })
      .catch(() => {});

    // Load my orders
    fetch("/api/orders?my=true")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) setMyOrders(d);
      })
      .catch(() => {});

    // Load my seva bookings
    fetch("/api/sevas/bookings?my=true")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) setMySevas(d);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/devotee-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password: loginPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setDevotee(data.devotee);
        loadDevoteeData();
      } else {
        alert(data.error || "Login failed");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/devotee-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName,
          phone: regPhone,
          email: regEmail,
          password: regPassword,
          gotra: regGotra,
          panNumber: regPan,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDevotee(data.devotee);
        loadDevoteeData();
      } else {
        alert(data.error || "Registration failed");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setDevotee(null);
  };

  const downloadDonationReceipt = async (donationId: string) => {
    try {
      const res = await fetch(`/api/donations/${donationId}/receipt`);
      const data = await res.json();
      const doc = generateDonationReceiptPDF(data);
      doc.save(`Mandir_Donation_${data.receiptNumber}.pdf`);
    } catch (err) {
      alert("Failed to download receipt.");
    }
  };

  const downloadSevaPass = (booking: any) => {
    const doc = generateSevaPassPDF({
      bookingNumber: booking.bookingNumber,
      devoteeName: booking.devoteeName,
      devoteePhone: booking.devoteePhone,
      gotra: booking.gotra,
      nakshatra: booking.nakshatra,
      sankalpa: booking.sankalpa,
      familyMembers: booking.familyMembers,
      sevaName: booking.seva?.name || "Temple Seva",
      deityName: booking.seva?.deityName || "Lord Mahadev",
      bookingDate: new Date(booking.bookingDate).toLocaleDateString("en-IN"),
      timeSlot: booking.bookingTimeSlot,
      numberOfPeople: booking.numberOfPeople,
      amountPaid: booking.totalAmount,
    });
    doc.save(`Mandir_Seva_Pass_${booking.bookingNumber}.pdf`);
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-500 font-serif">
        Loading devotee portal...
      </div>
    );
  }

  // NON-AUTHENTICATED DEVOTEE LOGIN / REGISTER VIEW
  if (!devotee) {
    return (
      <div className="py-16 bg-[#FDFBF7]">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl border border-amber-200 p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-amber-100 text-[#7B1113] rounded-full flex items-center justify-center mx-auto text-xl font-serif font-bold">
                ॐ
              </div>
              <h1 className="font-serif font-bold text-2xl text-[#7B1113]">
                {lang === "hi" ? "भक्त सेवा पोर्टल" : "Devotee Service Portal"}
              </h1>
              <p className="text-xs text-slate-500">
                Log in to view past donations, download 80G tax receipts, track prasad shipments, and access seva passes.
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex border-b border-slate-200">
              <button
                onClick={() => setAuthMode("login")}
                className={`flex-1 py-2 text-xs font-bold border-b-2 transition-all ${
                  authMode === "login"
                    ? "border-[#7B1113] text-[#7B1113]"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                Log In
              </button>
              <button
                onClick={() => setAuthMode("register")}
                className={`flex-1 py-2 text-xs font-bold border-b-2 transition-all ${
                  authMode === "register"
                    ? "border-[#7B1113] text-[#7B1113]"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                Register Profile
              </button>
            </div>

            {authMode === "login" ? (
              <form onSubmit={handleLogin} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Registered Mobile / Email
                  </label>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Email address or mobile phone"
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#E58A13]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#E58A13]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#7B1113] hover:bg-[#9B1C1E] text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow"
                >
                  Access Devotee Portal
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Ramesh Srivastava"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#E58A13]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Mobile Phone *</label>
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#E58A13]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="devotee@mandir.org"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#E58A13]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Gotra (गोत्र)</label>
                    <input
                      type="text"
                      value={regGotra}
                      onChange={(e) => setRegGotra(e.target.value)}
                      placeholder="e.g. Kashyapa"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#E58A13]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">PAN (for 80G)</label>
                    <input
                      type="text"
                      value={regPan}
                      onChange={(e) => setRegPan(e.target.value.toUpperCase())}
                      placeholder="ABCDE1234F"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg uppercase outline-none focus:ring-2 focus:ring-[#E58A13]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Set Password *</label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#E58A13]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#7B1113] hover:bg-[#9B1C1E] text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow"
                >
                  Create Devotee Account
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  // AUTHENTICATED DEVOTEE DASHBOARD VIEW
  return (
    <div className="py-12 bg-[#FDFBF7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Profile Card Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-amber-200 p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#7B1113] to-[#9B1C1E] text-[#FDE68A] font-serif text-2xl font-bold flex items-center justify-center shadow">
              {devotee.name.charAt(0)}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#E58A13]">
                Registered Devotee
              </span>
              <h1 className="font-serif font-bold text-2xl text-slate-900">
                {devotee.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                {devotee.phone && <span className="flex items-center space-x-1"><Phone className="w-3 h-3 text-[#E58A13]" /><span>{devotee.phone}</span></span>}
                {devotee.email && <span className="flex items-center space-x-1"><Mail className="w-3 h-3 text-[#E58A13]" /><span>{devotee.email}</span></span>}
                {devotee.gotra && <span className="font-semibold text-slate-700">Gotra: {devotee.gotra}</span>}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-700 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-colors self-end sm:self-auto"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-amber-200 space-x-2">
          <button
            onClick={() => setActiveTab("donations")}
            className={`px-5 py-3 font-serif font-bold text-sm border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === "donations"
                ? "border-[#7B1113] text-[#7B1113]"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Donations & Receipts ({myDonations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            className={`px-5 py-3 font-serif font-bold text-sm border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === "orders"
                ? "border-[#7B1113] text-[#7B1113]"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Prasad Orders ({myOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("sevas")}
            className={`px-5 py-3 font-serif font-bold text-sm border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === "sevas"
                ? "border-[#7B1113] text-[#7B1113]"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>Seva Passes ({mySevas.length})</span>
          </button>
        </div>

        {/* Tab 1: Donations History */}
        {activeTab === "donations" && (
          <div className="bg-white rounded-2xl shadow-sm border border-amber-200 p-6 space-y-4">
            {myDonations.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <p>No donation records found yet.</p>
                <Link href="/donations" className="text-xs text-[#7B1113] font-bold underline mt-1 inline-block">
                  Make your first contribution &rarr;
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-amber-50 text-slate-700 font-bold border-b border-amber-200">
                    <tr>
                      <th className="py-3 px-4">Receipt No</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Seva Category</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">PDF Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {myDonations.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-50">
                        <td className="py-3.5 px-4 font-mono font-bold text-[#7B1113]">
                          {d.receiptNumber}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {new Date(d.createdAt).toLocaleDateString("en-IN")}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-800">
                          {d.category?.name}
                        </td>
                        <td className="py-3.5 px-4 font-serif font-bold text-slate-900">
                          ₹{d.amount.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {d.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => downloadDonationReceipt(d.id)}
                            className="inline-flex items-center space-x-1 px-3 py-1 bg-amber-100 hover:bg-amber-200 text-[#7B1113] font-bold rounded-lg text-[11px] shadow-xs"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download PDF</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Prasad Orders History */}
        {activeTab === "orders" && (
          <div className="bg-white rounded-2xl shadow-sm border border-amber-200 p-6 space-y-4">
            {myOrders.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <p>No prasad orders placed yet.</p>
                <Link href="/store" className="text-xs text-[#7B1113] font-bold underline mt-1 inline-block">
                  Browse Consecrated Prasad &rarr;
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {myOrders.map((ord) => (
                  <div key={ord.id} className="p-4 rounded-xl border border-amber-200/80 bg-amber-50/20 text-xs space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-mono font-bold text-[#7B1113] text-sm">{ord.orderNumber}</span>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Placed on {new Date(ord.createdAt).toLocaleDateString("en-IN")}
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-200 text-slate-900">
                        {ord.orderStatus}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-100 text-slate-700">
                      <p>
                        <strong>Items:</strong> {ord.orderItems?.map((i: any) => `${i.productName} (x${i.quantity})`).join(", ")}
                      </p>
                      <p className="mt-1">
                        <strong>Fulfillment:</strong> {ord.deliveryType === "PICKUP" ? "Counter Pickup" : "Home Delivery"}
                      </p>
                      <p className="font-serif font-bold text-sm text-[#7B1113] mt-2">
                        Total: ₹{ord.totalAmount.toLocaleString("en-IN")}/-
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Seva Passes History */}
        {activeTab === "sevas" && (
          <div className="bg-white rounded-2xl shadow-sm border border-amber-200 p-6 space-y-4">
            {mySevas.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <p>No seva bookings found.</p>
                <Link href="/sevas" className="text-xs text-[#7B1113] font-bold underline mt-1 inline-block">
                  Book a Vedic Seva &rarr;
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {mySevas.map((sb) => (
                  <div key={sb.id} className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 text-xs space-y-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <span className="font-mono font-bold text-[#7B1113] text-sm">Pass #{sb.bookingNumber}</span>
                      <h3 className="font-serif font-bold text-base text-slate-900 mt-0.5">{sb.seva?.name}</h3>
                      <p className="text-slate-600 mt-0.5">
                        Scheduled for: <strong>{new Date(sb.bookingDate).toLocaleDateString("en-IN")}</strong> at <strong>{sb.bookingTimeSlot}</strong>
                      </p>
                      {sb.sankalpa && <p className="text-[11px] text-slate-500 italic mt-0.5">Sankalpa: {sb.sankalpa}</p>}
                    </div>

                    <button
                      onClick={() => downloadSevaPass(sb)}
                      className="px-4 py-2 bg-[#7B1113] text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow"
                    >
                      <Download className="w-3.5 h-3.5 text-amber-300" />
                      <span>Download Pass (PDF)</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
