"use client";

import React from "react";
import { useLanguage } from "@/lib/language-context";
import Link from "next/link";
import {
  Clock,
  Sparkles,
  ShieldAlert,
  Flame,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  Info,
} from "lucide-react";

export default function DarshanTimingsPage() {
  const { lang, t } = useLanguage();

  const aartis = [
    {
      name: lang === "hi" ? "मंगला आरती" : "Mangala Aarti",
      time: "05:00 AM",
      bellRinging: "04:45 AM",
      desc:
        lang === "hi"
          ? "प्रथम प्रभात में प्रभु का पावन जागरण, पवित्र गोदुग्ध अभिषेक एवं वैदिक मंगलाचरण।"
          : "Sacred dawn awakening ceremony, holy milk bath, stotra chanting, and auspicious morning blessings.",
      bhog: "Fresh Mawa, Mishri & Tulsi Dal",
      badge: "Dawn Sanctum Awakening",
    },
    {
      name: lang === "hi" ? "शृंगार आरती" : "Shringar Aarti",
      time: "06:30 AM",
      bellRinging: "06:15 AM",
      desc:
        lang === "hi"
          ? "प्रभु का दिव्य शृंगार, स्वर्ण आभूषण, मोगरा-गुलाब पुष्पमाला एवं रेशमी पीताम्बर धारण।"
          : "Beholding the divine deity adorned in golden ornaments, fresh floral garlands, and silk robes.",
      bhog: "Panchamrit & Seasonal Fruits",
      badge: "Divine Floral Adornment",
    },
    {
      name: lang === "hi" ? "राजभोग आरती" : "Rajbhog Aarti",
      time: "12:00 PM",
      bellRinging: "11:45 AM",
      desc:
        lang === "hi"
          ? "दोपहर 56 भोग समर्पण, धूप-दीप दर्शन एवं पवित्र घंटनाद।"
          : "Grand midday meal offering of traditional sweets, rice, dal, and consecrated delicacies.",
      bhog: "56 Chhappan Bhog & Desi Ghee Kheer",
      badge: "Midday Grand Feast",
    },
    {
      name: lang === "hi" ? "संध्या आरती" : "Sandhya Aarti",
      time: "07:00 PM",
      bellRinging: "06:45 PM",
      desc:
        lang === "hi"
          ? "गोदूलि वेला में कपूर आरती, शंख ध्वनि, सहस्र दीप प्रज्ज्वलन एवं संगीतमय स्तुति।"
          : "Evening oil and camphor lamp ceremony accompanied by resonant conch shells and sacred chants.",
      bhog: "Kesar Halwa & Panchamrit Peda",
      badge: "Evening Twilight Lamps",
    },
    {
      name: lang === "hi" ? "शयन आरती" : "Shayan Aarti",
      time: "09:30 PM",
      bellRinging: "09:15 PM",
      desc:
        lang === "hi"
          ? "रात्रि विश्राम से पूर्व प्रभु को सुगंधित चंदन, पुष्प समर्पण एवं लोरी गायन।"
          : "Night retirement ceremony with fragrant sandalwood, soft musical hymns, and peaceful sanctum closure.",
      bhog: "Hot Cardamom Saffron Milk",
      badge: "Night Sanctum Rest",
    },
  ];

  return (
    <div className="py-12 bg-[#FDFBF7]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Page Title Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-[#7B1113] text-xs font-semibold">
            <Clock className="w-3.5 h-3.5 text-[#E58A13]" />
            <span>{lang === "hi" ? "नित्य दर्शन सारणी" : "Sanctum Visiting Schedule"}</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-[#7B1113]">
            {lang === "hi" ? "दैनिक आरती एवं दर्शन समय" : "Daily Aarti & Darshan Schedule"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
            {lang === "hi"
              ? "मंदिर के पट प्रतिदिन प्रातः 05:00 बजे खुलते हैं तथा रात्रि 09:30 बजे शयन आरती उपरांत बंद होते हैं।"
              : "The temple gates open at 05:00 AM and close after Shayan Aarti at 09:30 PM. All devotees are welcome."}
          </p>
        </div>

        {/* General Darshan Windows Card */}
        <div className="bg-gradient-to-r from-[#7B1113] via-[#8C1619] to-[#5C0A0C] text-white rounded-2xl p-6 sm:p-8 shadow-xl border-2 border-[#E58A13]">
          <h2 className="font-serif font-bold text-lg sm:text-xl text-[#FEF3C7] mb-4 flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-[#F59E0B]" />
            <span>General Visiting Hours (निःशुल्क सामान्य दर्शन)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="p-4 rounded-xl bg-white/10 border border-white/15 backdrop-blur-xs">
              <span className="text-amber-200 uppercase font-semibold text-[11px] block">Morning Session</span>
              <span className="font-serif text-xl sm:text-2xl font-bold text-white mt-1 block">
                05:00 AM - 12:30 PM
              </span>
              <span className="text-amber-200/80 text-xs mt-1 block">
                Mangala, Shringar, and Rajbhog Darshan windows.
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white/10 border border-white/15 backdrop-blur-xs">
              <span className="text-amber-200 uppercase font-semibold text-[11px] block">Evening Session</span>
              <span className="font-serif text-xl sm:text-2xl font-bold text-white mt-1 block">
                04:00 PM - 09:30 PM
              </span>
              <span className="text-amber-200/80 text-xs mt-1 block">
                Sandhya Aarti, Deepotsav, and Shayan Aarti windows.
              </span>
            </div>
          </div>

          <p className="text-xs text-amber-200/70 mt-4 text-center sm:text-left">
            * Temple remains closed between 12:30 PM to 04:00 PM for the deity&apos;s afternoon rest ( विश्राम ).
          </p>
        </div>

        {/* 5 Sacred Aartis Detailed Cards */}
        <div className="space-y-4">
          <h2 className="font-serif font-bold text-2xl text-[#7B1113] border-b pb-2">
            Five Sacred Daily Aartis (पंच आरती)
          </h2>

          <div className="space-y-4">
            {aartis.map((aarti, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-amber-200/80 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100/70 text-[#7B1113] font-serif font-bold text-lg flex items-center justify-center shrink-0 border border-amber-300">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-serif font-bold text-lg text-slate-900">
                        {aarti.name}
                      </h3>
                      <span className="bg-amber-100 text-[#7B1113] text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {aarti.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 max-w-xl leading-relaxed">
                      {aarti.desc}
                    </p>
                    <p className="text-[11px] text-amber-800 font-medium mt-2">
                      Consecrated Bhog: <span className="text-slate-800 font-semibold">{aarti.bhog}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-6">
                  <span className="font-mono text-2xl font-extrabold text-[#7B1113] block">
                    {aarti.time}
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Entry opens: {aarti.bellRinging}
                  </span>
                  <Link
                    href="/sevas"
                    className="inline-block mt-2 text-xs font-bold text-[#E58A13] hover:text-[#7B1113] underline"
                  >
                    Reserve Seva Slot &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sanctum Guidelines & Devotee Code of Conduct */}
        <div className="bg-white rounded-2xl p-8 border border-amber-200 shadow-sm space-y-6">
          <h2 className="font-serif font-bold text-xl text-[#7B1113] border-b pb-3 flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            <span>Devotee Guidelines & Sanctum Rules</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700">
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Dress Code:</strong> Modest Indian traditional attire is recommended (Kurta-Pyjama / Dhoti for men, Saree / Salwar for women).
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Footwear Stand:</strong> Free and secure shoe counters are situated at Gate No. 1 and Gate No. 3.
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Divyangjan & Senior Citizens:</strong> Wheelchairs, golf carts, and ramped priority queues are available at Gate 2.
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Prohibited Items:</strong> Mobile phone cameras, leather belts, tobacco, matchboxes, and heavy baggage inside inner sanctum.
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Free Locker Facility:</strong> Devotees can store their phones, wallets, and bags safely at the Pilgrims Facilitation Center.
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Free Mahaprasad Dining:</strong> Annadan Hall serves continuous hot satvik meals from 11:30 AM to 03:30 PM daily.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
