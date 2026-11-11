"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/lib/language-context";
import { generateDonationReceiptPDF } from "@/lib/receipt";
import { launchRazorpayModal, loadRazorpayScript } from "@/lib/razorpay-client";
import {
  Heart,
  ShieldCheck,
  CheckCircle2,
  Download,
  Flame,
  Sparkles,
  Info,
  CreditCard,
  QrCode,
  FileText,
} from "lucide-react";

export default function DonationsPage() {
  const { lang, t } = useLanguage();
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<string>("");
  const [amount, setAmount] = useState<number>(1100);
  const [customAmount, setCustomAmount] = useState<string>("");

  // Devotee form
  const [donorName, setDonorName] = useState<string>("");
  const [donorPhone, setDonorPhone] = useState<string>("");
  const [donorEmail, setDonorEmail] = useState<string>("");
  const [donorAddress, setDonorAddress] = useState<string>("");
  const [gotra, setGotra] = useState<string>("");
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [is80G, setIs80G] = useState<boolean>(true);
  const [donorPan, setDonorPan] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  useEffect(() => {
    loadRazorpayScript();
    fetch("/api/donations/categories")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
          let targetId = data.length > 0 ? data[0].id : "";
          if (typeof window !== "undefined") {
            const p = new URLSearchParams(window.location.search);
            const catParam = p.get("categoryId") || p.get("cat");
            if (catParam) {
              const matched = data.find((c: any) => c.id === catParam || c.slug === catParam);
              if (matched) targetId = matched.id;
            }
            const amtParam = p.get("amount");
            if (amtParam && !isNaN(Number(amtParam))) {
              setAmount(Number(amtParam));
            }
          }
          if (targetId) setSelectedCatId(targetId);
        }
      })
      .catch(() => {});
  }, []);

  const selectedCategory = categories.find((c) => c.id === selectedCatId);

  const handleDonationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = customAmount ? parseFloat(customAmount) : amount;
    if (!finalAmount || finalAmount <= 0) {
      alert("Please provide a valid donation amount.");
      return;
    }
    if (!donorName || !donorPhone) {
      alert("Donor full name and phone number are required.");
      return;
    }
    if (is80G && !donorPan) {
      alert("Please provide your PAN card number to claim 80G tax exemption receipt.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: selectedCatId,
          amount: finalAmount,
          donorName,
          donorPhone,
          donorEmail: donorEmail || null,
          donorAddress: donorAddress || null,
          donorPan: is80G ? donorPan.toUpperCase().trim() : null,
          gotra: gotra || null,
          isAnonymous,
          isTaxExempt80G: is80G,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to initiate donation");
      }

      // Launch Official Razorpay Payment Gateway Modal
      await launchRazorpayModal({
        key: data.gatewayOrder.key,
        orderId: data.gatewayOrder.id,
        amount: data.gatewayOrder.amount,
        name: "Shri Ram Mandir & Mahadev Mandir",
        description: `Sacred Donation: ${selectedCategory?.name || "Temple Fund"}`,
        prefill: {
          name: donorName,
          email: donorEmail,
          contact: donorPhone,
        },
        onSuccess: async (response) => {
          setLoading(true);
          try {
            const verifyRes = await fetch("/api/donations/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                donationId: data.donationId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              const receiptRes = await fetch(`/api/donations/${data.donationId}/receipt`);
              const receiptJson = await receiptRes.json();
              setReceiptData(receiptJson);
            } else {
              alert("Payment verification failed: " + (verifyData.error || "Invalid cryptographic signature"));
            }
          } catch (err: any) {
            alert("Verification error: " + err.message);
          } finally {
            setLoading(false);
          }
        },
        onError: (err) => {
          alert(`Payment Failed: ${err?.description || "Transaction was not completed"}`);
          setLoading(false);
        },
        onDismiss: () => {
          setLoading(false);
        },
      });
    } catch (err: any) {
      alert(err.message || "Failed to process donation.");
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!receiptData) return;
    const doc = generateDonationReceiptPDF(receiptData);
    doc.save(`Mandir_Donation_Receipt_${receiptData.receiptNumber}.pdf`);
  };

  return (
    <div className="py-12 bg-[#FDFBF7]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Banner */}
        <div className="text-center space-y-3 mb-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-[#7B1113] text-xs font-semibold">
            <Flame className="w-3.5 h-3.5 text-[#E58A13]" />
            <span>{lang === "hi" ? "पवित्र दान एवं सेवा समर्पण" : "Sacred Seva Contribution"}</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#7B1113]">
            {t("donate.heading")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
            {t("donate.sub")}
          </p>
        </div>

        {receiptData ? (
          /* SUCCESS & PDF RECEIPT STATE */
          <div className="bg-white rounded-2xl shadow-xl border-2 border-emerald-500/60 p-8 sm:p-12 text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
                Payment Confirmed & Verified
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                ॥ जय श्री राम ॥ Har Har Mahadev!
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-lg mx-auto">
                Thank you, <strong className="text-slate-800">{receiptData.donorName}</strong>. Your divine contribution of{" "}
                <strong className="text-[#7B1113]">₹{receiptData.amount.toLocaleString("en-IN")}/-</strong> has been credited to the Temple Seva Treasury.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-6 text-left max-w-md mx-auto space-y-2 text-xs">
              <div className="flex justify-between pb-2 border-b border-amber-200">
                <span className="text-slate-500">Official Receipt No:</span>
                <span className="font-mono font-bold text-slate-900">{receiptData.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction Ref:</span>
                <span className="font-mono text-slate-700">{receiptData.transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Seva Purpose:</span>
                <span className="font-semibold text-slate-800">{receiptData.categoryName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date:</span>
                <span className="text-slate-700">{receiptData.date}</span>
              </div>
              {receiptData.isTaxExempt80G && receiptData.donorPan && (
                <div className="flex justify-between pt-2 border-t border-amber-200 text-emerald-800 font-semibold">
                  <span>80G Exemption PAN:</span>
                  <span>{receiptData.donorPan}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap gap-4 justify-center">
              <button
                onClick={downloadPDF}
                className="px-6 py-3.5 bg-gradient-to-r from-[#7B1113] to-[#9B1C1E] text-white font-bold rounded-xl shadow-lg hover:brightness-110 flex items-center space-x-2 text-xs uppercase tracking-wider"
              >
                <Download className="w-4 h-4 text-amber-300" />
                <span>{t("common.downloadReceipt")}</span>
              </button>

              <button
                onClick={() => setReceiptData(null)}
                className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
              >
                Make Another Contribution
              </button>
            </div>
          </div>
        ) : (
          /* DONATION FORM */
          <form
            onSubmit={handleDonationSubmit}
            className="bg-white rounded-2xl shadow-xl border border-amber-200/80 p-6 sm:p-10 space-y-8"
          >
            {/* 1. Category Selection */}
            <div>
              <label className="block font-serif font-bold text-base text-[#7B1113] mb-3">
                1. {lang === "hi" ? "दान सेवा कोष का चयन करें" : "Select Donation Purpose / Seva"}
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {categories.map((c) => {
                  const isSelected = selectedCatId === c.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCatId(c.id)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? "border-[#7B1113] bg-amber-50/80 shadow-md"
                          : "border-slate-200 hover:border-amber-300 bg-white"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="font-serif font-bold text-sm text-slate-900">
                          {lang === "hi" ? c.nameHi : c.name}
                        </h3>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-[#7B1113] shrink-0" />}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {lang === "hi" && c.descriptionHi ? c.descriptionHi : c.description}
                      </p>
                      <span className="inline-block mt-2 text-[10px] text-amber-800 font-semibold bg-amber-100/60 px-2 py-0.5 rounded">
                        Min ₹{c.minAmount}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Amount Selection */}
            <div>
              <label className="block font-serif font-bold text-base text-[#7B1113] mb-3">
                2. {lang === "hi" ? "दान राशि चुनें" : "Select Contribution Amount"}
              </label>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                {[251, 501, 1100, 2100, 5100, 11000].map((amt) => (
                  <button
                    type="button"
                    key={amt}
                    onClick={() => {
                      setAmount(amt);
                      setCustomAmount("");
                    }}
                    className={`py-3 rounded-xl font-bold text-sm border-2 transition-all ${
                      amount === amt && !customAmount
                        ? "bg-[#7B1113] text-white border-[#7B1113] shadow-md scale-102"
                        : "bg-white text-slate-700 border-slate-200 hover:border-[#E58A13]"
                    }`}
                  >
                    ₹{amt.toLocaleString("en-IN")}
                  </button>
                ))}
              </div>

              <div className="mt-3">
                <input
                  type="number"
                  placeholder="Or enter any custom donation amount in ₹ (INR)"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-[#E58A13] outline-none"
                />
              </div>
            </div>

            {/* 3. Devotee Details */}
            <div className="space-y-4">
              <label className="block font-serif font-bold text-base text-[#7B1113]">
                3. {lang === "hi" ? "दानदाता एवं संकल्प विवरण" : "Devotee & Sankalpa Information"}
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t("donate.donorName")} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Kumar"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-[#E58A13] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t("donate.donorPhone")} *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={donorPhone}
                    onChange={(e) => setDonorPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-[#E58A13] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t("donate.donorEmail")}
                  </label>
                  <input
                    type="email"
                    placeholder="For receiving digital receipt"
                    value={donorEmail}
                    onChange={(e) => setDonorEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-[#E58A13] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t("donate.gotra")}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Kashyapa, Bharadwaj, Vashishtha"
                    value={gotra}
                    onChange={(e) => setGotra(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-[#E58A13] outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Devotee Residential Address (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="City, State, Pincode"
                    value={donorAddress}
                    onChange={(e) => setDonorAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-[#E58A13] outline-none"
                  />
                </div>
              </div>

              {/* Gupt Daan / Anonymous Toggle */}
              <label className="flex items-center space-x-2.5 text-xs text-slate-700 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded text-[#7B1113] focus:ring-[#7B1113]"
                />
                <span>{t("donate.anonymous")}</span>
              </label>

              {/* 80G Tax Exemption Section */}
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 space-y-2 text-xs">
                <div className="flex items-start space-x-2">
                  <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <label className="flex items-center space-x-2 font-bold text-amber-900 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={is80G}
                        onChange={(e) => setIs80G(e.target.checked)}
                        className="rounded text-[#E58A13] focus:ring-[#E58A13]"
                      />
                      <span>Claim 80G Income Tax Deduction Certificate</span>
                    </label>
                    <p className="text-[11px] text-amber-800/80 mt-0.5">
                      {t("donate.taxNotice")}
                    </p>
                  </div>
                </div>

                {is80G && (
                  <div className="pt-2">
                    <label className="block font-semibold text-amber-900 mb-1">
                      {t("donate.pan")} *
                    </label>
                    <input
                      type="text"
                      required={is80G}
                      placeholder="e.g. ABCDE1234F"
                      value={donorPan}
                      onChange={(e) => setDonorPan(e.target.value.toUpperCase())}
                      className="w-full sm:w-1/2 px-3 py-2 border border-amber-300 rounded-lg uppercase font-mono text-slate-900 bg-white outline-none"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 4. Payment Submission Button */}
            <div className="pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-[#7B1113] to-[#9B1C1E] text-white font-bold rounded-xl shadow-lg hover:brightness-110 active:scale-98 transition-all text-sm tracking-wider uppercase flex items-center justify-center space-x-2"
              >
                <Heart className="w-4 h-4 fill-current text-amber-300" />
                <span>
                  {loading
                    ? "Processing Divine Contribution..."
                    : `Contribute ₹${((customAmount ? parseFloat(customAmount) : amount) || 0).toLocaleString("en-IN")} & Get PDF Receipt`}
                </span>
              </button>

              <div className="flex items-center justify-center space-x-4 mt-3 text-[11px] text-slate-500">
                <span className="flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>256-bit Secure Gateway</span>
                </span>
                <span>•</span>
                <span>Supports UPI, Cards & NetBanking</span>
                <span>•</span>
                <span>Automated PDF Receipt</span>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
