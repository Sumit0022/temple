"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Heart,
  ShoppingBag,
  Flame,
  Users,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  Plus,
  Clock,
  ShieldCheck,
  FileText,
  Activity,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data) => {
        setStats(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500 font-serif">
        Loading real-time temple operations metrics...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold text-[#E58A13] uppercase tracking-wider">
            Executive Command Center
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#7B1113]">
            Temple Operations & Treasury Dashboard
          </h1>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link
            href="/admin/donations?action=offline"
            className="px-4 py-2 bg-[#7B1113] hover:bg-[#9B1C1E] text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Cash Donation</span>
          </Link>

          <Link
            href="/admin/finance?action=expense"
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Expense</span>
          </Link>
        </div>
      </div>

      {/* 1. Core Operational KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Donations */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Seva Donations
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#7B1113] flex items-center justify-center">
              <Heart className="w-5 h-5 fill-current" />
            </div>
          </div>
          <div className="mt-4">
            <span className="font-serif font-extrabold text-2xl text-slate-900 block">
              ₹{stats?.donations?.totalAmount?.toLocaleString("en-IN") || 0}
            </span>
            <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1">
              <span>Today: <strong className="text-emerald-600">₹{stats?.donations?.todayAmount?.toLocaleString("en-IN") || 0}</strong></span>
              <span>•</span>
              <span>This Month: <strong>₹{stats?.donations?.monthAmount?.toLocaleString("en-IN") || 0}</strong></span>
            </div>
          </div>
        </div>

        {/* Prasad Store Revenue */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Prasad Store Revenue
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#E58A13] flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="font-serif font-extrabold text-2xl text-slate-900 block">
              ₹{stats?.store?.totalSales?.toLocaleString("en-IN") || 0}
            </span>
            <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1">
              <span>{stats?.store?.totalOrders || 0} Orders</span>
              <span>•</span>
              <span className="text-amber-700 font-bold">{stats?.store?.pendingOrdersCount || 0} Pending Dispatch</span>
            </div>
          </div>
        </div>

        {/* Seva Bookings */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Vedic Seva Bookings
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#7B1113] flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="font-serif font-extrabold text-2xl text-slate-900 block">
              {stats?.sevas?.totalBookings || 0}
            </span>
            <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1">
              <span className="text-emerald-700 font-semibold">Active & Attended Sevas</span>
            </div>
          </div>
        </div>

        {/* Registered Devotees */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Registered Devotees
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#E58A13] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="font-serif font-extrabold text-2xl text-slate-900 block">
              {stats?.devotees?.totalCount || 0}
            </span>
            <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1">
              <span>Profiles & Yajamans</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Low Stock Warning Bar (If any) */}
      {stats?.inventory?.lowStockItems?.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-xs text-amber-900 uppercase tracking-wider">
                Low Stock Threshold Alerts:
              </h3>
              <p className="text-xs text-amber-800 mt-0.5">
                {stats.inventory.lowStockItems.map((item: any) => `${item.name} (${item.currentStock} ${item.unit} left)`).join(" • ")}
              </p>
            </div>
          </div>
          <Link
            href="/admin/inventory"
            className="px-3.5 py-1.5 bg-[#7B1113] text-white font-bold rounded-lg text-xs whitespace-nowrap shadow-xs"
          >
            Manage Supplies &rarr;
          </Link>
        </div>
      )}

      {/* 3. Category Breakdown & Today's Sevas Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Donation Category Breakdown */}
        <div className="lg:col-span-7 bg-white rounded-2xl shadow-xs border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="font-serif font-bold text-base text-slate-900 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-[#E58A13]" />
              <span>Donation Funds Breakdown</span>
            </h2>
            <Link href="/admin/donations" className="text-xs text-[#7B1113] font-bold hover:underline">
              View Ledger
            </Link>
          </div>

          <div className="space-y-4">
            {stats?.donations?.categoryBreakdown?.map((cat: any) => {
              const totalAll = stats.donations.totalAmount || 1;
              const percent = Math.round((cat.amount / totalAll) * 100);

              return (
                <div key={cat.id} className="space-y-1.5 text-xs">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-800">{cat.name} ({cat.count} donations)</span>
                    <span className="font-serif font-bold text-[#7B1113]">
                      ₹{cat.amount.toLocaleString("en-IN")} ({percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#7B1113] to-[#E58A13] h-2.5 rounded-full"
                      style={{ width: `${Math.min(100, Math.max(5, percent))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Today's Booked Seva Roster */}
        <div className="lg:col-span-5 bg-white rounded-2xl shadow-xs border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="font-serif font-bold text-base text-slate-900 flex items-center space-x-2">
              <Flame className="w-4 h-4 text-[#7B1113]" />
              <span>Upcoming / Today&apos;s Sevas</span>
            </h2>
            <Link href="/admin/sevas" className="text-xs text-[#7B1113] font-bold hover:underline">
              Pujari Roster
            </Link>
          </div>

          {stats?.sevas?.todayBookings?.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No scheduled seva bookings for today.</p>
          ) : (
            <div className="space-y-3">
              {stats?.sevas?.todayBookings?.map((sb: any) => (
                <div key={sb.id} className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/80 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="font-bold text-[#7B1113]">{sb.seva?.name}</span>
                    <span className="font-mono text-slate-600">{sb.bookingTimeSlot}</span>
                  </div>
                  <p className="text-slate-700">
                    Devotee: <strong>{sb.devoteeName}</strong> ({sb.gotra || "Swagotra"})
                  </p>
                  {sb.sankalpa && (
                    <p className="text-[11px] text-slate-500 italic">Sankalpa: {sb.sankalpa}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. Recent Financial Ledger Transactions & System Audit Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Financial Transactions */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 space-y-4">
          <h2 className="font-serif font-bold text-base text-slate-900 border-b pb-2 flex items-center space-x-2">
            <FileText className="w-4 h-4 text-[#E58A13]" />
            <span>Recent Treasury Transactions</span>
          </h2>

          <div className="space-y-2.5 text-xs">
            {stats?.recentTransactions?.map((tx: any) => (
              <div key={tx.id} className="p-2.5 rounded-lg border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="font-mono text-[10px] text-slate-400">{tx.transactionNumber}</span>
                  <p className="font-medium text-slate-800 line-clamp-1">{tx.description}</p>
                  <span className="text-[10px] text-slate-400">{new Date(tx.transactionDate).toLocaleDateString("en-IN")} • {tx.paymentMethod}</span>
                </div>
                <span className={`font-serif font-bold text-sm ${tx.type === "INCOME" ? "text-emerald-600" : "text-red-600"}`}>
                  {tx.type === "INCOME" ? "+" : "-"}₹{tx.amount.toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Security & System Audit Logs */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 space-y-4">
          <h2 className="font-serif font-bold text-base text-slate-900 border-b pb-2 flex items-center space-x-2">
            <Activity className="w-4 h-4 text-[#7B1113]" />
            <span>Operational Audit Trail</span>
          </h2>

          <div className="space-y-2.5 text-xs">
            {stats?.recentAudit?.map((log: any) => (
              <div key={log.id} className="p-2.5 rounded-lg border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900">{log.action}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                      {log.entity}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    By: {log.user ? `${log.user.name} (${log.user.role})` : "System / Devotee"}
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
