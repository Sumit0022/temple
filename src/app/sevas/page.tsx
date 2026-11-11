"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/lib/language-context";
import { generateSevaPassPDF } from "@/lib/receipt";
import { launchRazorpayModal, loadRazorpayScript } from "@/lib/razorpay-client";
import {
  Sparkles,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Download,
  Flame,
  User,
  Users,
  ChevronRight,
  AlertCircle,
  X,
} from "lucide-react";

export default function SevasPage() {
  const { lang, t } = useLanguage();
  const [sevas, setSevas] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedSeva, setSelectedSeva] = useState<any>(null);

  // Booking Form State
  const [bookingDate, setBookingDate] = useState<string>("");
  const [minDate, setMinDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [slotInfo, setSlotInfo] = useState<any>(null);
  const [checkingSlots, setCheckingSlots] = useState<boolean>(false);

  // Devotee Sankalpa Details
  const [devoteeName, setDevoteeName] = useState<string>("");
  const [devoteePhone, setDevoteePhone] = useState<string>("");
  const [devoteeEmail, setDevoteeEmail] = useState<string>("");
  const [gotra, setGotra] = useState<string>("");
  const [nakshatra, setNakshatra] = useState<string>("");
  const [rashi, setRashi] = useState<string>("");
  const [sankalpa, setSankalpa] = useState<string>("");
  const [familyMembers, setFamilyMembers] = useState<string>("");
  const [numberOfPeople, setNumberOfPeople] = useState<number>(2);

  const [bookingLoading, setBookingLoading] = useState<boolean>(false);
  const [confirmedPass, setConfirmedPass] = useState<any>(null);

  useEffect(() => {
    loadRazorpayScript();
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];
    setMinDate(todayStr);
    setBookingDate(tomorrowStr);

    fetch("/api/sevas")
      .then((r) => r.json())
      .then((data) => {
        if (data.sevas) {
          setSevas(data.sevas);
          if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const preselectedId = params.get("id");
            if (preselectedId) {
              const matched = data.sevas.find((s: any) => s.id === preselectedId);
              if (matched) setSelectedSeva(matched);
            }
          }
        }
        if (data.categories) setCategories(data.categories);
      })
      .catch(() => {});
  }, []);

  // Check slot availability when seva or date changes
  useEffect(() => {
    if (!selectedSeva || !bookingDate) return;
    setCheckingSlots(true);
    fetch(`/api/sevas/slots?sevaId=${selectedSeva.id}&date=${bookingDate}`)
      .then((r) => r.json())
      .then((data) => {
        setSlotInfo(data);
        if (data.availableTimings && data.availableTimings.length > 0) {
          setSelectedSlot(data.availableTimings[0]);
        }
      })
      .catch(() => {})
      .finally(() => setCheckingSlots(false));
  }, [selectedSeva, bookingDate]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeva || !bookingDate || !selectedSlot) {
      alert("Please select a date and time slot.");
      return;
    }
    if (!devoteeName || !devoteePhone) {
      alert("Please provide devotee name and mobile phone.");
      return;
    }

    setBookingLoading(true);
    try {
      const res = await fetch("/api/sevas/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sevaId: selectedSeva.id,
          bookingDate,
          bookingTimeSlot: selectedSlot,
          devoteeName,
          devoteePhone,
          devoteeEmail: devoteeEmail || null,
          gotra: gotra || null,
          nakshatra: nakshatra || null,
          rashi: rashi || null,
          sankalpa: sankalpa || "Loka Kalyana & Family Prosperity",
          familyMembers: familyMembers || null,
          numberOfPeople,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to initiate seva booking.");
      }

      // Launch Official Razorpay Modal
      await launchRazorpayModal({
        key: data.gatewayOrder.key,
        orderId: data.gatewayOrder.id,
        amount: data.gatewayOrder.amount,
        name: "Shri Ram Mandir & Mahadev Mandir",
        description: `Sacred Puja / Seva: ${selectedSeva.name}`,
        prefill: {
          name: devoteeName,
          email: devoteeEmail,
          contact: devoteePhone,
        },
        onSuccess: async (response) => {
          setBookingLoading(true);
          try {
            const verifyRes = await fetch("/api/sevas/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                bookingId: data.bookingId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              setConfirmedPass({
                bookingNumber: verifyData.booking.bookingNumber,
                devoteeName: verifyData.booking.devoteeName,
                devoteePhone: verifyData.booking.devoteePhone,
                gotra: verifyData.booking.gotra,
                nakshatra: verifyData.booking.nakshatra,
                sankalpa: verifyData.booking.sankalpa,
                familyMembers: verifyData.booking.familyMembers,
                sevaName: selectedSeva.name,
                deityName: selectedSeva.deityName,
                bookingDate: new Date(verifyData.booking.bookingDate).toLocaleDateString("en-IN"),
                timeSlot: verifyData.booking.bookingTimeSlot,
                numberOfPeople: verifyData.booking.numberOfPeople,
                amountPaid: verifyData.booking.totalAmount,
              });
              setSelectedSeva(null);
            } else {
              alert("Payment confirmation failed: " + (verifyData.error || "Invalid signature"));
            }
          } catch (err: any) {
            alert("Verification error: " + err.message);
          } finally {
            setBookingLoading(false);
          }
        },
        onError: (err) => {
          alert(`Payment Failed: ${err?.description || "Transaction not completed"}`);
          setBookingLoading(false);
        },
        onDismiss: () => {
          setBookingLoading(false);
        },
      });
    } catch (err: any) {
      alert(err.message || "Failed to book seva.");
      setBookingLoading(false);
    }
  };

  const downloadPassPDF = () => {
    if (!confirmedPass) return;
    const doc = generateSevaPassPDF(confirmedPass);
    doc.save(`Mandir_Seva_Pass_${confirmedPass.bookingNumber}.pdf`);
  };

  return (
    <div className="py-12 bg-[#FDFBF7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center space-y-3 mb-10 pb-4 border-b border-amber-200">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-[#7B1113] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[#E58A13]" />
            <span>{lang === "hi" ? "वैदिक पूजा एवं विशेष अभिषेक" : "Sacred Vedic Rituals"}</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#7B1113]">
            {t("seva.heading")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
            {t("seva.sub")}
          </p>
        </div>

        {/* Confirmed Pass Banner */}
        {confirmedPass && (
          <div className="mb-12 bg-white rounded-2xl shadow-xl border-2 border-emerald-500 p-8 sm:p-10 text-center space-y-6 max-w-2xl mx-auto">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
                Seva Booking Confirmed
              </span>
              <h2 className="font-serif text-2xl font-bold text-slate-900 mt-1">
                ॥ जय श्री राम ॥ Your Sacred Seva is Scheduled
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Pass Number: <strong className="font-mono text-slate-900">{confirmedPass.bookingNumber}</strong>
              </p>
            </div>

            <div className="bg-amber-50 rounded-xl p-4 text-left border border-amber-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Ritual:</span>
                <span className="font-bold text-slate-900">{confirmedPass.sevaName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date & Slot:</span>
                <span className="font-bold text-[#7B1113]">
                  {confirmedPass.bookingDate} at {confirmedPass.timeSlot}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Yajaman (Devotee):</span>
                <span>{confirmedPass.devoteeName} ({confirmedPass.gotra || "Swagotra"})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Dakshina Paid:</span>
                <span className="font-bold text-emerald-700">₹{confirmedPass.amountPaid}/-</span>
              </div>
            </div>

            <div className="pt-2 flex justify-center space-x-3">
              <button
                onClick={downloadPassPDF}
                className="px-6 py-3 bg-[#7B1113] hover:bg-[#9B1C1E] text-white font-bold rounded-xl text-xs flex items-center space-x-2 shadow"
              >
                <Download className="w-4 h-4 text-amber-300" />
                <span>Download Official Seva Pass (PDF)</span>
              </button>

              <button
                onClick={() => setConfirmedPass(null)}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* Sevas Listing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sevas.map((seva) => (
            <div
              key={seva.id}
              className="bg-white rounded-2xl shadow-sm border border-amber-200/80 overflow-hidden flex flex-col justify-between hover:shadow-xl transition-all group"
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <span className="text-[11px] font-bold text-[#E58A13] bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                    {seva.deityName}
                  </span>
                  <div className="text-right">
                    <span className="font-serif font-bold text-xl text-[#7B1113]">
                      ₹{seva.price.toLocaleString("en-IN")}
                    </span>
                    <span className="block text-[10px] text-slate-400">Dakshina</span>
                  </div>
                </div>

                <h3 className="font-serif font-bold text-lg text-slate-900 mt-3 group-hover:text-[#7B1113] transition-colors">
                  {lang === "hi" ? seva.nameHi : seva.name}
                </h3>

                <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                  {lang === "hi" && seva.descriptionHi ? seva.descriptionHi : seva.description}
                </p>

                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-500">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Duration: {seva.durationMinutes} mins</span>
                    </span>
                    <span>Max {seva.maxBookingsPerDay} slots/day</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-slate-600">
                    <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="truncate">Slots: {seva.timings}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-amber-50/60 border-t border-amber-100">
                <button
                  onClick={() => setSelectedSeva(seva)}
                  className="w-full py-3 bg-gradient-to-r from-[#7B1113] to-[#9B1C1E] text-white font-bold rounded-xl text-xs tracking-wider uppercase flex items-center justify-center space-x-1.5 shadow hover:brightness-110 active:scale-98 transition-all"
                >
                  <Flame className="w-3.5 h-3.5 text-amber-300" />
                  <span>{t("seva.bookNow")}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Booking Dialog / Modal */}
        {selectedSeva && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 relative shadow-2xl border border-amber-300 max-h-[92vh] overflow-y-auto">
              <button
                onClick={() => setSelectedSeva(null)}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="border-b pb-3 mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#E58A13]">
                  {selectedSeva.deityName}
                </span>
                <h2 className="font-serif font-bold text-xl text-[#7B1113]">
                  {lang === "hi" ? selectedSeva.nameHi : selectedSeva.name}
                </h2>
                <p className="font-serif text-sm font-bold text-slate-800 mt-0.5">
                  Dakshina: ₹{selectedSeva.price.toLocaleString("en-IN")}/-
                </p>
              </div>

              <form onSubmit={handleBookingSubmit} className="space-y-4 text-xs">
                {/* 1. Date & Slot Picker */}
                <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-800 mb-1">
                        Select Seva Date *
                      </label>
                      <input
                        type="date"
                        required
                        min={minDate}
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-[#E58A13]"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-800 mb-1">
                        Available Time Slot *
                      </label>
                      {checkingSlots ? (
                        <div className="py-2 text-slate-500 text-xs">Checking real-time slots...</div>
                      ) : slotInfo?.isAvailable ? (
                        <select
                          value={selectedSlot}
                          onChange={(e) => setSelectedSlot(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-[#E58A13]"
                        >
                          {slotInfo.availableTimings.map((t: string) => (
                            <option key={t} value={t}>
                              {t} (Remaining slots: {slotInfo.remainingSlots})
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="text-red-600 font-semibold py-2">
                          All slots booked for this date. Please choose another date.
                        </div>
                      )}
                    </div>
                  </div>

                  {slotInfo && (
                    <div className="flex items-center space-x-1.5 text-[11px] text-amber-900 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>
                        Capacity limit: {slotInfo.bookedCount} / {slotInfo.maxBookingsPerDay} booked. Double-booking prevented.
                      </span>
                    </div>
                  )}
                </div>

                {/* 2. Devotee Sankalpa Information */}
                <div className="space-y-3">
                  <h3 className="font-serif font-bold text-sm text-slate-900">
                    Devotee & Sankalpa Particulars
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Yajaman Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Anand Murti Sharma"
                        value={devoteeName}
                        onChange={(e) => setDevoteeName(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#E58A13]"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Mobile Phone *</label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={devoteePhone}
                        onChange={(e) => setDevoteePhone(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#E58A13]"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Gotra (गोत्र)</label>
                      <input
                        type="text"
                        placeholder="e.g. Kashyapa / Bharadwaj"
                        value={gotra}
                        onChange={(e) => setGotra(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#E58A13]"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Nakshatra / Rashi</label>
                      <input
                        type="text"
                        placeholder="e.g. Rohini / Vrishabha"
                        value={nakshatra}
                        onChange={(e) => setNakshatra(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#E58A13]"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-slate-700 mb-1">
                        Sankalpa Intention / Reason for Puja
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Family peace, good health, birthday sankalpa"
                        value={sankalpa}
                        onChange={(e) => setSankalpa(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#E58A13]"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-slate-700 mb-1">
                        Family Members to Include in Sankalpa
                      </label>
                      <input
                        type="text"
                        placeholder="Names separated by comma"
                        value={familyMembers}
                        onChange={(e) => setFamilyMembers(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#E58A13]"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <button
                    type="submit"
                    disabled={bookingLoading || !slotInfo?.isAvailable}
                    className="w-full py-3.5 bg-gradient-to-r from-[#7B1113] to-[#9B1C1E] text-white font-bold rounded-xl shadow-md hover:brightness-110 active:scale-98 transition-all text-xs tracking-wider uppercase flex items-center justify-center space-x-1.5"
                  >
                    <span>
                      {bookingLoading
                        ? "Confirming Seva Slot..."
                        : `Confirm & Pay ₹${selectedSeva.price.toLocaleString("en-IN")} Dakshina`}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
