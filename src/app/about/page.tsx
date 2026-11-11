"use client";

import React from "react";
import { useLanguage } from "@/lib/language-context";
import Link from "next/link";
import {
  ShieldCheck,
  Building,
  Heart,
  Users,
  Award,
  Sparkles,
  HelpCircle,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

export default function AboutPage() {
  const { lang, t } = useLanguage();

  const faqs = [
    {
      q: "How can I obtain an 80G Tax Exemption receipt for my donation?",
      a: "When making an online or counter donation, select the 80G tax exemption option and enter your 10-digit PAN number. Your official digitally stamped PDF receipt containing the Income Tax Order Number CIT(E)/AYODHYA/80G/2024/AABTS1234F is generated immediately for your tax return filings.",
    },
    {
      q: "Are the prasadam sweets prepared with pure ingredients?",
      a: "Yes. All sacred bhog offerings (Peda, Besan Ladoos, Panchamrit) are prepared in the consecrated temple kitchen using 100% pure desi Gir cow ghee, organic grain flour, and fresh aromatic spices under strict hygienic and satvik traditional guidelines.",
    },
    {
      q: "How does the home delivery for Prasad work?",
      a: "We pack consecrated bhog in moisture-sealed, gold-embossed food-grade boxes and dispatch them across India via express courier within 24 hours of consecration so that devotees receive fresh prasad at their doorstep.",
    },
    {
      q: "Can I book a personalized Rudrabhishek or Ram Archana with family Gotra?",
      a: "Yes. Visit the 'Puja & Sevas' portal, choose your desired date and time slot, and submit your family's Gotra, Nakshatra, and personal Sankalpa. Our head priests will chant your names during the sacred Vedic ceremony.",
    },
    {
      q: "What is the dress code for visiting the temple sanctum?",
      a: "Modest traditional attire is encouraged (Dhoti-Kurta or Pyjama for men; Saree or Salwar-Kameez for women). Short dresses and western beachwear are not permitted inside the sanctum sanctorum.",
    },
  ];

  return (
    <div className="py-12 bg-[#FDFBF7]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="text-center space-y-3 pb-4 border-b border-amber-200">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-[#7B1113] text-xs font-semibold">
            <Building className="w-3.5 h-3.5 text-[#E58A13]" />
            <span>{lang === "hi" ? "मंदिर परिचय एवं इतिहास" : "Heritage & Trust Overview"}</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-[#7B1113]">
            {lang === "hi" ? "श्री राम एवं महादेव मंदिर परिचय" : "About Shri Ram & Mahadev Mandir"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
            {lang === "hi"
              ? "सनातन संस्कृति, भक्ति, नित्य अन्नदान एवं लोक कल्याण को समर्पित पावन तीर्थ।"
              : "An eternal sanctuary of Sanatana Dharma, Vedic scholarship, daily Annadan feeding, and spiritual upliftment."}
          </p>
        </div>

        {/* History & Significance */}
        <div className="bg-white rounded-2xl p-8 sm:p-10 border border-amber-200 shadow-sm space-y-6">
          <div className="flex items-center space-x-3 text-[#7B1113]">
            <Sparkles className="w-6 h-6 text-[#E58A13]" />
            <h2 className="font-serif font-bold text-2xl">
              Sacred Heritage & Spiritual Significance
            </h2>
          </div>

          <p className="text-slate-700 text-sm leading-relaxed">
            Situated in the divine heart of Ayodhya Dham on the sacred banks of the Saryu River, the Shri Ram Janmabhoomi & Mahadev Mandir stands as a monumental beacon of Indian architecture, faith, and timeless values. Rooted in millennia-old traditions, the sanctum enshrines Bhagwan Shri Ramachandra alongside Lord Mahadev in their most peaceful, benevolent forms.
          </p>

          <p className="text-slate-700 text-sm leading-relaxed">
            Built from pink sandstone carved meticulously by traditional temple sculptors, the complex encompasses the primary Garbhagriha, majestic Mandapas, a Vedic Yajnashala, an Annadan Bhojanalaya serving over 5,000 pilgrims daily, and a Gaushala nurturing indigenous Gir cows.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-center">
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
              <span className="font-serif text-2xl font-bold text-[#7B1113] block">100% Satvik</span>
              <span className="text-xs text-slate-600 mt-1 block">Pure Cow Ghee Mahaprasad</span>
            </div>
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
              <span className="font-serif text-2xl font-bold text-[#7B1113] block">5 Times Daily</span>
              <span className="text-xs text-slate-600 mt-1 block">Sacred Aarti & Stotras</span>
            </div>
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
              <span className="font-serif text-2xl font-bold text-[#7B1113] block">Sec 80G</span>
              <span className="text-xs text-slate-600 mt-1 block">Income Tax Deductible</span>
            </div>
          </div>
        </div>

        {/* Trust Governance & Registration */}
        <div className="bg-white rounded-2xl p-8 sm:p-10 border border-amber-200 shadow-sm space-y-6">
          <div className="flex items-center space-x-3 text-[#7B1113]">
            <ShieldCheck className="w-6 h-6 text-[#E58A13]" />
            <h2 className="font-serif font-bold text-2xl">
              Temple Trust Governance & Legal Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
              <span className="text-slate-500">Registered Trust Name:</span>
              <p className="font-bold text-slate-900 text-sm">Shri Ram Mahadev Mandir Charitable Trust</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
              <span className="text-slate-500">Trust Registration Number:</span>
              <p className="font-mono font-bold text-slate-900 text-sm">TRUST/UP/AYD/2020/00482</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
              <span className="text-slate-500">Income Tax 80G Registration:</span>
              <p className="font-mono font-bold text-slate-900 text-sm">CIT(E)/AYODHYA/80G/2024/AABTS1234F</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
              <span className="text-slate-500">Auditor & Financial Oversight:</span>
              <p className="font-bold text-slate-900 text-sm">Audited annually by Chartered Accountants</p>
            </div>
          </div>
        </div>

        {/* Frequently Asked Questions (FAQs) */}
        <div className="bg-white rounded-2xl p-8 sm:p-10 border border-amber-200 shadow-sm space-y-6">
          <div className="flex items-center space-x-3 text-[#7B1113]">
            <HelpCircle className="w-6 h-6 text-[#E58A13]" />
            <h2 className="font-serif font-bold text-2xl">
              Frequently Asked Questions (Devotee Help)
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="p-5 rounded-xl bg-amber-50/50 border border-amber-200/60">
                <h3 className="font-serif font-bold text-sm text-slate-900">
                  {idx + 1}. {faq.q}
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
