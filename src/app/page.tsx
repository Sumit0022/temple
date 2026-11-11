"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import { useCart } from "@/lib/cart-context";
import { parseImages } from "@/lib/utils";
import { launchRazorpayModal, loadRazorpayScript } from "@/lib/razorpay-client";
import {
  Sparkles,
  Heart,
  Calendar,
  Clock,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Utensils,
  MapPin,
  ChevronRight,
  Flame,
  Award,
} from "lucide-react";

export default function HomePage() {
  const { lang, t } = useLanguage();
  const { addToCart } = useCart();

  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [sevas, setSevas] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  // Quick Donation state
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [donationAmount, setDonationAmount] = useState<number>(501);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [donorName, setDonorName] = useState<string>("");
  const [donorPhone, setDonorPhone] = useState<string>("");
  const [is80G, setIs80G] = useState<boolean>(true);
  const [donorPan, setDonorPan] = useState<string>("");
  const [submittingDonation, setSubmittingDonation] = useState<boolean>(false);
  const [donationSuccessMsg, setDonationSuccessMsg] = useState<string>("");

  useEffect(() => {
    loadRazorpayScript();
    // Fetch categories
    fetch("/api/donations/categories")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
          if (data.length > 0) setSelectedCategory(data[0].id);
        }
      })
      .catch(() => {});

    // Fetch products
    fetch("/api/products?featured=true")
      .then((r) => r.json())
      .then((data) => {
        if (data.products) setProducts(data.products.slice(0, 4));
      })
      .catch(() => {});

    // Fetch sevas
    fetch("/api/sevas")
      .then((r) => r.json())
      .then((data) => {
        if (data.sevas) setSevas(data.sevas.filter((s: any) => s.isFeatured).slice(0, 3));
      })
      .catch(() => {});

    // Fetch events
    fetch("/api/content/events")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setEvents(data.slice(0, 3));
      })
      .catch(() => {});

    // Fetch announcements
    fetch("/api/content/announcements")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setAnnouncements(data);
      })
      .catch(() => {});
  }, []);

  const handleQuickDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = customAmount ? parseFloat(customAmount) : donationAmount;
    if (!finalAmount || finalAmount <= 0) {
      alert("Please enter a valid donation amount.");
      return;
    }
    if (!donorName || !donorPhone) {
      alert("Please enter your name and phone number.");
      return;
    }

    setSubmittingDonation(true);
    try {
      const res = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: selectedCategory,
          amount: finalAmount,
          donorName,
          donorPhone,
          donorPan: is80G ? donorPan : null,
          isTaxExempt80G: is80G,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        alert(data.error || "Failed to process donation.");
        setSubmittingDonation(false);
        return;
      }

      await launchRazorpayModal({
        key: data.gatewayOrder.key,
        orderId: data.gatewayOrder.id,
        amount: data.gatewayOrder.amount,
        name: "Shri Ram Mandir & Mahadev Mandir",
        description: `Sacred Donation (Quick Devotion)`,
        prefill: {
          name: donorName,
          contact: donorPhone,
        },
        onSuccess: async (response) => {
          setSubmittingDonation(true);
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
              setDonationSuccessMsg(
                `Har Har Mahadev! Your donation of ₹${finalAmount.toLocaleString("en-IN")} has been received. Official 80G Receipt #${data.receiptNumber} generated.`
              );
              setDonorName("");
              setDonorPhone("");
              setDonorPan("");
            } else {
              alert("Payment verification failed: " + (verifyData.error || "Invalid cryptographic signature"));
            }
          } catch (err: any) {
            alert("Verification error: " + err.message);
          } finally {
            setSubmittingDonation(false);
          }
        },
        onError: (err) => {
          alert(`Payment Failed: ${err?.description || "Transaction not completed"}`);
          setSubmittingDonation(false);
        },
        onDismiss: () => {
          setSubmittingDonation(false);
        },
      });
    } catch (err: any) {
      alert("Error: " + err.message);
      setSubmittingDonation(false);
    }
  };

  const aartiSchedule = [
    { name: t("darshan.mangala"), time: "05:00 AM", desc: "Awakening & sacred milk abhishek" },
    { name: t("darshan.shringar"), time: "06:30 AM", desc: "Adornment with fresh flowers & pitambar" },
    { name: t("darshan.bhog"), time: "12:00 PM", desc: "Offering of 56 Bhog Mahaprasad" },
    { name: t("darshan.sandhya"), time: "07:00 PM", desc: "Evening lamp ceremony with stotra recitation" },
    { name: t("darshan.shayan"), time: "09:30 PM", desc: "Night lullaby & restful sanctum closure" },
  ];

  return (
    <div className="flex flex-col space-y-16 lg:space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#7B1113] via-[#8C1619] to-[#5C0A0C] text-white pt-12 pb-20 lg:pt-20 lg:pb-32">
        {/* Subtle decorative background motif */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#F59E0B_1px,transparent_1px)] [background-size:24px_24px]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/10 border border-[#E58A13]/40 text-amber-200 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>{t("hero.subtitle")}</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#FEF3C7] leading-tight drop-shadow-sm">
                {t("hero.title")}
              </h1>

              <p className="text-amber-100/90 text-sm sm:text-base lg:text-lg max-w-2xl leading-relaxed">
                {t("hero.desc")}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-2">
                <Link
                  href="/donations"
                  className="px-6 py-3.5 rounded-full bg-gradient-to-r from-[#E58A13] to-[#F59E0B] text-slate-950 font-bold text-sm tracking-wide shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center space-x-2"
                >
                  <Heart className="w-4 h-4 fill-current text-red-700" />
                  <span>{t("nav.donateNow")}</span>
                </Link>

                <Link
                  href="/sevas"
                  className="px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold text-sm tracking-wide backdrop-blur-sm transition-all flex items-center space-x-2"
                >
                  <span>{t("hero.bookSevaBtn")}</span>
                  <ArrowRight className="w-4 h-4 text-[#F59E0B]" />
                </Link>

                <Link
                  href="/darshan-timings"
                  className="px-5 py-3.5 rounded-full bg-transparent hover:bg-black/20 text-amber-200 text-sm font-medium transition-colors flex items-center space-x-1"
                >
                  <Clock className="w-4 h-4" />
                  <span>{t("hero.darshanBtn")}</span>
                </Link>
              </div>

              {/* Quick Trust Highlights */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-white/15 max-w-lg mx-auto lg:mx-0">
                <div>
                  <p className="font-serif text-xl sm:text-2xl font-bold text-[#FDE68A]">5,000+</p>
                  <p className="text-[11px] text-amber-200/80 uppercase tracking-wider">{lang === "hi" ? "नित्य अन्नदान" : "Daily Annadan"}</p>
                </div>
                <div>
                  <p className="font-serif text-xl sm:text-2xl font-bold text-[#FDE68A]">100%</p>
                  <p className="text-[11px] text-amber-200/80 uppercase tracking-wider">{lang === "hi" ? "पारदर्शी रसीद" : "Verified Receipts"}</p>
                </div>
                <div>
                  <p className="font-serif text-xl sm:text-2xl font-bold text-[#FDE68A]">80G</p>
                  <p className="text-[11px] text-amber-200/80 uppercase tracking-wider">{lang === "hi" ? "आयकर छूट" : "Tax Exemption"}</p>
                </div>
              </div>
            </div>

            {/* Right Card: Quick Donation Widget */}
            <div className="lg:col-span-5">
              <div className="bg-[#FAF7F0] text-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 border-2 border-[#E58A13] relative">
                <div className="flex items-center justify-between pb-4 border-b border-amber-200">
                  <div className="flex items-center space-x-2">
                    <Flame className="w-5 h-5 text-[#E58A13]" />
                    <h2 className="font-serif font-bold text-lg text-[#7B1113]">
                      {lang === "hi" ? "त्वरित ऑनलाइन सेवा दान" : "Quick Online Donation"}
                    </h2>
                  </div>
                  <span className="text-[11px] bg-amber-100 text-[#7B1113] font-semibold px-2 py-0.5 rounded border border-amber-300">
                    Instant 80G PDF
                  </span>
                </div>

                {donationSuccessMsg ? (
                  <div className="py-8 text-center space-y-4">
                    <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
                    <p className="font-medium text-emerald-800 text-sm">{donationSuccessMsg}</p>
                    <div className="pt-2 flex justify-center space-x-3">
                      <Link
                        href="/donations"
                        className="px-4 py-2 bg-[#7B1113] text-white text-xs font-bold rounded-lg shadow"
                      >
                        {t("common.downloadReceipt")}
                      </Link>
                      <button
                        onClick={() => setDonationSuccessMsg("")}
                        className="px-4 py-2 bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg"
                      >
                        Donate Again
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleQuickDonation} className="mt-4 space-y-4 text-xs">
                    {/* Category Selection */}
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        {lang === "hi" ? "दान सेवा कोष चुनें:" : "Select Seva Purpose:"}
                      </label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800 text-xs focus:ring-2 focus:ring-[#E58A13] outline-none"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {lang === "hi" ? c.nameHi : c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Amount Presets */}
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1.5">
                        {lang === "hi" ? "दान राशि (रुपये):" : "Donation Amount (INR):"}
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {[101, 501, 1100, 5100].map((amt) => (
                          <button
                            type="button"
                            key={amt}
                            onClick={() => {
                              setDonationAmount(amt);
                              setCustomAmount("");
                            }}
                            className={`py-2 rounded-lg font-bold text-xs border transition-all ${
                              donationAmount === amt && !customAmount
                                ? "bg-[#7B1113] text-white border-[#7B1113] shadow"
                                : "bg-white text-slate-700 border-slate-300 hover:border-[#E58A13]"
                            }`}
                          >
                            ₹{amt}
                          </button>
                        ))}
                      </div>

                      <div className="mt-2">
                        <input
                          type="number"
                          placeholder={t("donate.customAmount")}
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-[#E58A13] outline-none"
                        />
                      </div>
                    </div>

                    {/* Donor Details */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          {t("donate.donorName")} *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Ramesh Sharma"
                          value={donorName}
                          onChange={(e) => setDonorName(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-xs text-slate-800 focus:ring-2 focus:ring-[#E58A13] outline-none"
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
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-xs text-slate-800 focus:ring-2 focus:ring-[#E58A13] outline-none"
                        />
                      </div>
                    </div>

                    {/* 80G Tax Exemption Toggle */}
                    <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 space-y-1.5">
                      <label className="flex items-center space-x-2 cursor-pointer font-medium text-slate-800">
                        <input
                          type="checkbox"
                          checked={is80G}
                          onChange={(e) => setIs80G(e.target.checked)}
                          className="rounded text-[#E58A13] focus:ring-[#E58A13]"
                        />
                        <span>{lang === "hi" ? "80G आयकर छूट रसीद चाहिए" : "Claim 80G Tax Exemption"}</span>
                      </label>
                      {is80G && (
                        <input
                          type="text"
                          placeholder="PAN Card (e.g. ABCDE1234F)"
                          value={donorPan}
                          onChange={(e) => setDonorPan(e.target.value.toUpperCase())}
                          className="w-full px-2.5 py-1.5 border border-amber-300 rounded bg-white text-xs uppercase text-slate-800 outline-none"
                        />
                      )}
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={submittingDonation}
                      className="w-full py-3 bg-gradient-to-r from-[#7B1113] to-[#9B1C1E] text-white font-bold rounded-lg shadow-md hover:brightness-110 active:scale-95 transition-all text-xs tracking-wide uppercase flex items-center justify-center space-x-1.5"
                    >
                      <Heart className="w-4 h-4 fill-current text-amber-300" />
                      <span>
                        {submittingDonation
                          ? "Connecting to Mandir Treasury..."
                          : `${t("donate.payBtn")} (₹${(customAmount ? parseFloat(customAmount) : donationAmount) || 0})`}
                      </span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. LIVE AARTI & DARSHAN TIMINGS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl border border-amber-200/80 p-6 sm:p-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-[#E58A13] uppercase tracking-wider flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{lang === "hi" ? "नित्य दर्शन सारणी" : "Daily Sanctum Schedule"}</span>
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#7B1113] mt-1">
                {t("darshan.heading")}
              </h2>
            </div>
            <p className="text-xs text-slate-500 max-w-md mt-2 md:mt-0">
              {t("darshan.sub")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {aartiSchedule.map((aarti, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-amber-100 bg-amber-50/40 hover:bg-amber-50 hover:border-[#E58A13] transition-all group"
              >
                <div className="flex justify-between items-start">
                  <span className="w-6 h-6 rounded-full bg-[#E58A13]/20 text-[#7B1113] font-bold text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="font-mono font-bold text-sm text-[#7B1113] bg-white px-2 py-0.5 rounded shadow-sm border border-amber-200">
                    {aarti.time}
                  </span>
                </div>
                <h3 className="font-serif font-bold text-slate-900 mt-3 group-hover:text-[#7B1113] transition-colors">
                  {aarti.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {aarti.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap justify-between items-center text-xs text-slate-600">
            <span>
              {lang === "hi"
                ? "विशेष पर्वों पर दर्शन समय में परिवर्तन हो सकता है।"
                : "Visiting rules: Modest traditional attire encouraged. Footwear stands available at Gate 1."}
            </span>
            <Link
              href="/darshan-timings"
              className="font-bold text-[#7B1113] hover:text-[#E58A13] flex items-center space-x-1 transition-colors"
            >
              <span>{lang === "hi" ? "विस्तृत दर्शन नियम एवं समय" : "Full Darshan Guidelines"}</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 3. FEATURED SEVAS & PUJA SERVICES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-[#E58A13] uppercase tracking-wider flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{lang === "hi" ? "वैदिक अनुष्ठान" : "Sacred Rituals & Pujas"}</span>
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#7B1113] mt-1">
              {t("seva.heading")}
            </h2>
          </div>
          <Link
            href="/sevas"
            className="text-xs font-bold text-[#7B1113] hover:text-[#E58A13] flex items-center space-x-1 transition-colors mt-2 md:mt-0"
          >
            <span>{t("common.viewAll")}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sevas.map((seva) => (
            <div
              key={seva.id}
              className="bg-white rounded-2xl shadow-md border border-amber-200/60 overflow-hidden flex flex-col justify-between hover:shadow-xl transition-all"
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <span className="text-[11px] font-semibold text-[#E58A13] bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                    {seva.deityName}
                  </span>
                  <span className="font-serif font-bold text-lg text-[#7B1113]">
                    ₹{seva.price.toLocaleString("en-IN")}
                  </span>
                </div>

                <h3 className="font-serif font-bold text-base sm:text-lg text-slate-900 mt-3">
                  {lang === "hi" ? seva.nameHi : seva.name}
                </h3>

                <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                  {lang === "hi" && seva.descriptionHi ? seva.descriptionHi : seva.description}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>{seva.durationMinutes} mins</span>
                  </span>
                  <span>Max {seva.maxBookingsPerDay} daily</span>
                </div>
              </div>

              <div className="p-4 bg-amber-50/60 border-t border-amber-100">
                <Link
                  href={`/sevas?id=${seva.id}`}
                  className="w-full py-2.5 bg-[#7B1113] hover:bg-[#9B1C1E] text-white font-bold rounded-lg text-xs flex items-center justify-center space-x-1 shadow transition-colors"
                >
                  <span>{t("seva.bookNow")}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. CONSECRATED PRASAD & DEVOTIONAL STORE PREVIEW */}
      <section className="bg-gradient-to-b from-[#F7F2E7] to-[#FDFBF7] py-16 border-y border-amber-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
            <div>
              <span className="text-xs font-bold text-[#E58A13] uppercase tracking-wider flex items-center space-x-1">
                <Utensils className="w-3.5 h-3.5" />
                <span>{lang === "hi" ? "मंदिर पाकशाला महाप्रसाद" : "Temple Consecrated Store"}</span>
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#7B1113] mt-1">
                {t("store.heading")}
              </h2>
            </div>
            <Link
              href="/store"
              className="text-xs font-bold text-[#7B1113] hover:text-[#E58A13] flex items-center space-x-1 transition-colors mt-2 md:mt-0"
            >
              <span>{t("common.viewAll")}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((prod) => {
              const images = parseImages(prod.images);
              const imgUrl = images[0] || "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80";

              return (
                <div
                  key={prod.id}
                  className="bg-white rounded-2xl shadow-sm border border-amber-200/60 overflow-hidden flex flex-col justify-between group hover:shadow-lg transition-all"
                >
                  <div className="relative h-44 overflow-hidden bg-amber-50">
                    <img
                      src={imgUrl}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {prod.shelfLifeDays && (
                      <span className="absolute top-2 left-2 bg-[#7B1113] text-amber-200 text-[10px] font-bold px-2 py-0.5 rounded shadow">
                        Fresh {prod.shelfLifeDays} Days
                      </span>
                    )}
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#E58A13]">
                        {prod.category?.name}
                      </span>
                      <h3 className="font-serif font-bold text-sm text-slate-900 mt-1 line-clamp-2">
                        {lang === "hi" ? prod.nameHi : prod.name}
                      </h3>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="font-serif font-bold text-base text-[#7B1113]">
                          ₹{prod.salePrice || prod.price}
                        </span>
                        {prod.salePrice && (
                          <span className="text-xs text-slate-400 line-through ml-1.5">
                            ₹{prod.price}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          addToCart({
                            id: prod.id,
                            name: prod.name,
                            nameHi: prod.nameHi,
                            slug: prod.slug,
                            price: prod.price,
                            salePrice: prod.salePrice,
                            image: imgUrl,
                            isPrasad: prod.isPrasad,
                          });
                          alert(`Added ${prod.name} to cart.`);
                        }}
                        className="p-2 rounded-lg bg-[#E58A13] hover:bg-[#F59E0B] text-slate-950 font-bold shadow transition-colors"
                        title="Add to Cart"
                      >
                        <ShoppingBag className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. UPCOMING FESTIVALS & EVENTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-[#E58A13] uppercase tracking-wider flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{lang === "hi" ? "उत्सव एवं धार्मिक पर्व" : "Upcoming Festivals & Celebrations"}</span>
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#7B1113] mt-1">
              {lang === "hi" ? "मंदिर महोत्सव एवं विशेष पर्व" : "Grand Religious Festivals & Events"}
            </h2>
          </div>
          <Link
            href="/events"
            className="text-xs font-bold text-[#7B1113] hover:text-[#E58A13] flex items-center space-x-1 transition-colors mt-2 md:mt-0"
          >
            <span>{t("common.viewAll")}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="bg-white rounded-2xl shadow-md border border-amber-200/60 overflow-hidden flex flex-col group hover:shadow-xl transition-all"
            >
              <div className="h-44 relative overflow-hidden bg-slate-900">
                <img
                  src={ev.bannerImage || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80"}
                  alt={ev.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                />
                <div className="absolute bottom-2 left-2 bg-[#7B1113] text-amber-200 font-bold text-xs px-2.5 py-1 rounded shadow">
                  {new Date(ev.startDate).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif font-bold text-base text-slate-900 group-hover:text-[#7B1113] transition-colors">
                    {lang === "hi" ? ev.titleHi : ev.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                    {lang === "hi" && ev.descriptionHi ? ev.descriptionHi : ev.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center space-x-1 truncate max-w-[180px]">
                    <MapPin className="w-3.5 h-3.5 text-[#E58A13] shrink-0" />
                    <span className="truncate">{ev.location}</span>
                  </span>
                  <Link
                    href="/events"
                    className="font-bold text-[#7B1113] hover:text-[#E58A13] flex items-center space-x-1"
                  >
                    <span>Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. ANNOUNCEMENTS TICKER */}
      {announcements.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-amber-100/70 border-l-4 border-[#7B1113] rounded-r-xl p-4 sm:p-5 flex items-start space-x-3 shadow-sm">
            <Sparkles className="w-5 h-5 text-[#7B1113] shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-xs text-[#7B1113] uppercase tracking-wider">
                {lang === "hi" ? "मंदिर सूचना एवं विज्ञप्ति:" : "Temple Notice:"}
              </span>
              <p className="text-xs text-slate-800 mt-0.5 font-medium">
                {lang === "hi" ? announcements[0].messageHi : announcements[0].message}
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
