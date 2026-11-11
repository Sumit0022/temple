"use client";

import React, { useState, useEffect } from "react";
import { generateDonationReceiptPDF } from "@/lib/receipt";
import {
  Heart,
  Search,
  Filter,
  Plus,
  Download,
  FileSpreadsheet,
  CheckCircle,
  X,
  CreditCard,
  Building,
} from "lucide-react";

export default function AdminDonationsPage() {
  const [donations, setDonations] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [loading, setLoading] = useState(true);

  // Offline modal state
  const [offlineModalOpen, setOfflineModalOpen] = useState(false);
  const [offDonorName, setOffDonorName] = useState("");
  const [offDonorPhone, setOffDonorPhone] = useState("");
  const [offDonorEmail, setOffDonorEmail] = useState("");
  const [offDonorAddress, setOffDonorAddress] = useState("");
  const [offGotra, setOffGotra] = useState("");
  const [offCatId, setOffCatId] = useState("");
  const [offAmount, setOffAmount] = useState("");
  const [offMethod, setOffMethod] = useState("CASH");
  const [offIs80G, setOffIs80G] = useState(false);
  const [offPan, setOffPan] = useState("");
  const [offNotes, setOffNotes] = useState("");
  const [submittingOffline, setSubmittingOffline] = useState(false);

  const fetchDonations = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (selectedCat) params.append("categoryId", selectedCat);
    if (paymentStatus) params.append("paymentStatus", paymentStatus);
    if (paymentMethod) params.append("paymentMethod", paymentMethod);

    fetch(`/api/donations?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setDonations(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      if (p.get("action") === "offline") {
        setOfflineModalOpen(true);
      }
    }
    fetch("/api/donations/categories")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
          if (data.length > 0) setOffCatId(data[0].id);
        }
      });
  }, []);

  useEffect(() => {
    fetchDonations();
  }, [search, selectedCat, paymentStatus, paymentMethod]);

  const handleOfflineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offDonorName || !offDonorPhone || !offAmount || !offCatId) {
      alert("Please fill required fields.");
      return;
    }

    setSubmittingOffline(true);
    try {
      const res = await fetch("/api/donations/offline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: offCatId,
          amount: offAmount,
          donorName: offDonorName,
          donorPhone: offDonorPhone,
          donorEmail: offDonorEmail || null,
          donorAddress: offDonorAddress || null,
          gotra: offGotra || null,
          paymentMethod: offMethod,
          isTaxExempt80G: offIs80G,
          donorPan: offIs80G ? offPan : null,
          notes: offNotes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert(data.message);
        setOfflineModalOpen(false);
        setOffDonorName("");
        setOffDonorPhone("");
        setOffAmount("");
        fetchDonations();
      } else {
        alert(data.error || "Failed to record offline donation.");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSubmittingOffline(false);
    }
  };

  const downloadReceipt = async (id: string) => {
    try {
      const res = await fetch(`/api/donations/${id}/receipt`);
      const data = await res.json();
      const doc = generateDonationReceiptPDF(data);
      doc.save(`Mandir_Donation_${data.receiptNumber}.pdf`);
    } catch (e) {
      alert("Failed to download receipt.");
    }
  };

  const exportToCSV = () => {
    if (!donations.length) return;
    const headers = [
      "Receipt Number",
      "Date",
      "Donor Name",
      "Phone",
      "Email",
      "PAN",
      "Category",
      "Amount",
      "Payment Method",
      "Status",
    ];

    const rows = donations.map((d) => [
      d.receiptNumber,
      new Date(d.createdAt).toISOString().split("T")[0],
      `"${d.donorName.replace(/"/g, '""')}"`,
      d.donorPhone,
      d.donorEmail || "",
      d.donorPan || "",
      `"${d.category?.name || ""}"`,
      d.amount,
      d.paymentMethod,
      d.paymentStatus,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Temple_Donation_Report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold text-[#E58A13] uppercase tracking-wider">
            Treasury Administration
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#7B1113]">
            Donations & 80G Receipts Ledger
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setOfflineModalOpen(true)}
            className="px-4 py-2 bg-[#7B1113] hover:bg-[#9B1C1E] text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Offline Cash / Cheque</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 flex flex-wrap gap-3 items-center justify-between text-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by donor name, phone, receipt no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#E58A13]"
          />
        </div>

        <select
          value={selectedCat}
          onChange={(e) => setSelectedCat(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-[#E58A13]"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-[#E58A13]"
        >
          <option value="">All Payment Modes</option>
          <option value="ONLINE">ONLINE (Gateway)</option>
          <option value="UPI">UPI</option>
          <option value="CASH">CASH (Counter)</option>
          <option value="CHEQUE">CHEQUE</option>
          <option value="BANK_TRANSFER">BANK TRANSFER</option>
        </select>

        <select
          value={paymentStatus}
          onChange={(e) => setPaymentStatus(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-[#E58A13]"
        >
          <option value="">All Statuses</option>
          <option value="SUCCESS">SUCCESS</option>
          <option value="PENDING">PENDING</option>
          <option value="FAILED">FAILED</option>
        </select>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Receipt No</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Donor Name</th>
                <th className="py-3 px-4">Purpose</th>
                <th className="py-3 px-4">Mode</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">80G Status</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500 font-serif">
                    Loading donations ledger...
                  </td>
                </tr>
              ) : donations.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    No donation records found.
                  </td>
                </tr>
              ) : (
                donations.map((d) => (
                  <tr key={d.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#7B1113]">
                      {d.receiptNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(d.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{d.donorName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{d.donorPhone}</span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {d.category?.name}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">
                      {d.paymentMethod}
                    </td>
                    <td className="py-3 px-4 font-serif font-bold text-slate-900">
                      ₹{d.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-4">
                      {d.isTaxExempt80G ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          80G: {d.donorPan || "Yes"}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Regular</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          d.paymentStatus === "SUCCESS"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {d.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => downloadReceipt(d.id)}
                        className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-[#7B1113] font-bold rounded-lg text-[11px] border border-amber-200 shadow-xs inline-flex items-center space-x-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Offline Donation Modal */}
      {offlineModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 relative shadow-2xl border border-amber-300 max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setOfflineModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-slate-100 text-slate-500"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="font-serif font-bold text-xl text-[#7B1113] border-b pb-3 mb-4">
              Record Offline Donation (Counter / Cash / Cheque)
            </h2>

            <form onSubmit={handleOfflineSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Donor Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anand Murti"
                    value={offDonorName}
                    onChange={(e) => setOffDonorName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#E58A13]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mobile Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={offDonorPhone}
                    onChange={(e) => setOffDonorPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#E58A13]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Donation Category *</label>
                  <select
                    value={offCatId}
                    onChange={(e) => setOffCatId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white focus:ring-2 focus:ring-[#E58A13]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Method *</label>
                  <select
                    value={offMethod}
                    onChange={(e) => setOffMethod(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white focus:ring-2 focus:ring-[#E58A13]"
                  >
                    <option value="CASH">CASH (Temple Counter)</option>
                    <option value="UPI">UPI (QR Scan at Counter)</option>
                    <option value="CHEQUE">CHEQUE</option>
                    <option value="BANK_TRANSFER">DIRECT NEFT/RTGS</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Amount Contributed (INR) *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 5100"
                  value={offAmount}
                  onChange={(e) => setOffAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#E58A13]"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-2">
                <label className="flex items-center space-x-2 font-bold text-amber-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={offIs80G}
                    onChange={(e) => setOffIs80G(e.target.checked)}
                    className="rounded text-[#E58A13]"
                  />
                  <span>80G Income Tax Exemption Required</span>
                </label>
                {offIs80G && (
                  <input
                    type="text"
                    required={offIs80G}
                    placeholder="Donor PAN Card (e.g. ABCDE1234F)"
                    value={offPan}
                    onChange={(e) => setOffPan(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg uppercase bg-white outline-none"
                  />
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes / Cheque Number</label>
                <input
                  type="text"
                  placeholder="e.g. Cheque No 009281, SBI Bank"
                  value={offNotes}
                  onChange={(e) => setOffNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div className="pt-3 border-t">
                <button
                  type="submit"
                  disabled={submittingOffline}
                  className="w-full py-3 bg-[#7B1113] hover:bg-[#9B1C1E] text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow"
                >
                  {submittingOffline ? "Generating Official Receipt..." : "Record & Generate Official Receipt"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
