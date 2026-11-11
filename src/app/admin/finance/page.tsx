"use client";

import React, { useState, useEffect } from "react";
import {
  Coins,
  TrendingUp,
  TrendingDown,
  Plus,
  FileSpreadsheet,
  Calendar,
  CheckCircle,
  Building,
  Receipt,
  X,
} from "lucide-react";

export default function AdminFinancePage() {
  const [summary, setSummary] = useState<any>(null);
  const [recentExpenses, setRecentExpenses] = useState<any[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Record Expense Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [paidTo, setPaidTo] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("BANK_TRANSFER");
  const [supplierId, setSupplierId] = useState("");
  const [invoiceRef, setInvoiceRef] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchFinance = async () => {
    setLoading(true);
    try {
      const [ovRes, txRes] = await Promise.all([
        fetch("/api/finance/overview"),
        fetch("/api/finance/transactions"),
      ]);

      const ovData = await ovRes.json();
      const txData = await txRes.json();

      if (ovData.summary) setSummary(ovData.summary);
      if (ovData.recentExpenses) setRecentExpenses(ovData.recentExpenses);
      if (ovData.expenseCategories) {
        setExpenseCategories(ovData.expenseCategories);
        if (ovData.expenseCategories.length > 0) setCategoryId(ovData.expenseCategories[0].id);
      }
      if (ovData.suppliers) setSuppliers(ovData.suppliers);
      if (Array.isArray(txData)) setTransactions(txData);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      if (p.get("action") === "expense") {
        setModalOpen(true);
      }
    }
    fetchFinance();
  }, []);

  const handleRecordExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || !paidTo || !categoryId) {
      alert("Please fill all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/finance/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          categoryId,
          amount,
          paidTo,
          paymentMethod,
          supplierId: supplierId || null,
          invoiceRef,
          notes,
        }),
      });

      if (res.ok) {
        alert("Expense voucher recorded and posted to ledger.");
        setModalOpen(false);
        setTitle("");
        setAmount("");
        setPaidTo("");
        fetchFinance();
      } else {
        const d = await res.json();
        alert(d.error || "Failed to record expense");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const exportLedgerCSV = () => {
    if (!transactions.length) return;
    const headers = [
      "Txn Number",
      "Date",
      "Type",
      "Source",
      "Amount",
      "Payment Method",
      "Description",
      "Status",
    ];

    const rows = transactions.map((t) => [
      t.transactionNumber,
      new Date(t.transactionDate).toISOString().split("T")[0],
      t.type,
      t.source,
      t.amount,
      t.paymentMethod,
      `"${t.description.replace(/"/g, '""')}"`,
      t.status,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Temple_Financial_Ledger_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold text-[#E58A13] uppercase tracking-wider">
            Temple Trust Treasury & Audit
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#7B1113]">
            Accounts & Financial Double-Entry Ledger
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={exportLedgerCSV}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export Financial Ledger</span>
          </button>

          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 bg-[#7B1113] hover:bg-[#9B1C1E] text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Expense Voucher</span>
          </button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Total Income */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
          <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Total Operational Revenue</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="font-serif font-extrabold text-2xl text-emerald-700 mt-3 block">
            ₹{summary?.totalIncome?.toLocaleString("en-IN") || 0}
          </span>
          <div className="text-[11px] text-slate-500 mt-2 space-y-0.5 border-t pt-2">
            <div className="flex justify-between">
              <span>Donations:</span>
              <span className="font-semibold text-slate-800">₹{summary?.donationIncome?.toLocaleString("en-IN") || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Prasad Sales:</span>
              <span className="font-semibold text-slate-800">₹{summary?.storeIncome?.toLocaleString("en-IN") || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Seva Bookings:</span>
              <span className="font-semibold text-slate-800">₹{summary?.sevaIncome?.toLocaleString("en-IN") || 0}</span>
            </div>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
          <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Total Operational Expenses</span>
            <TrendingDown className="w-4 h-4 text-red-600" />
          </div>
          <span className="font-serif font-extrabold text-2xl text-red-600 mt-3 block">
            ₹{summary?.totalExpenses?.toLocaleString("en-IN") || 0}
          </span>
          <p className="text-[11px] text-slate-500 mt-2 border-t pt-2">
            Ingredients, Ghee, Electricity, Security & Priest Stipends
          </p>
        </div>

        {/* Net Treasury Balance */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
          <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Net Operating Surplus</span>
            <Coins className="w-4 h-4 text-[#E58A13]" />
          </div>
          <span className="font-serif font-extrabold text-2xl text-[#7B1113] mt-3 block">
            ₹{summary?.netSurplus?.toLocaleString("en-IN") || 0}
          </span>
          <p className="text-[11px] text-slate-500 mt-2 border-t pt-2">
            Reinvested into Temple Renovation & Daily Annadan
          </p>
        </div>
      </div>

      {/* Unified Financial Double-Entry Ledger */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-serif font-bold text-sm text-slate-800">
            Treasury Master Journal & Transactions ({transactions.length} entries)
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Transaction No</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4 text-right">Amount (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-amber-50/20">
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">
                    {tx.transactionNumber}
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {new Date(tx.transactionDate).toLocaleDateString("en-IN")}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      tx.type === "INCOME" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                    }`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-700">
                    {tx.source}
                  </td>
                  <td className="py-3 px-4 max-w-sm truncate text-slate-700">
                    {tx.description}
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-medium">
                    {tx.paymentMethod}
                  </td>
                  <td className={`py-3 px-4 text-right font-serif font-bold ${
                    tx.type === "INCOME" ? "text-emerald-700" : "text-red-600"
                  }`}>
                    {tx.type === "INCOME" ? "+" : "-"}₹{tx.amount.toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Expense Voucher Modal */}
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
              Record Operational Expense Voucher
            </h2>

            <form onSubmit={handleRecordExpense} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Expense Title / Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Procurement of Cow Ghee for Bhandar"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Expense Category *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white"
                  >
                    {expenseCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Voucher Amount (INR) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 25000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Paid To (Vendor/Person) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Gau Tirtha Organic Gaushala"
                    value={paidTo}
                    onChange={(e) => setPaidTo(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white"
                  >
                    <option value="BANK_TRANSFER">BANK TRANSFER (NEFT/RTGS)</option>
                    <option value="CASH">CASH</option>
                    <option value="UPI">UPI</option>
                    <option value="CHEQUE">CHEQUE</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Linked Supplier (Optional)</label>
                  <select
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white"
                  >
                    <option value="">None / Direct Vendor</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Invoice / Bill Ref No</label>
                  <input
                    type="text"
                    placeholder="e.g. BILL-99201"
                    value={invoiceRef}
                    onChange={(e) => setInvoiceRef(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes / Auditor Remarks</label>
                <textarea
                  rows={2}
                  placeholder="Approval notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div className="pt-3 border-t">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-[#7B1113] text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow"
                >
                  {submitting ? "Posting Voucher..." : "Approve & Post to Accounts Ledger"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
