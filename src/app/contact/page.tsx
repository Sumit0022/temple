"use client";

import React, { useState } from "react";
import { useLanguage } from "@/lib/language-context";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Sparkles,
  Send,
  CheckCircle2,
} from "lucide-react";

export default function ContactPage() {
  const { lang, t } = useLanguage();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="py-12 bg-[#FDFBF7]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 pb-4 border-b border-amber-200">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-[#7B1113] text-xs font-semibold">
            <MapPin className="w-3.5 h-3.5 text-[#E58A13]" />
            <span>{lang === "hi" ? "मंदिर तीर्थ स्थान एवं संपर्क" : "Temple Pilgrimage & Contact"}</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-[#7B1113]">
            {t("nav.contact")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
            {lang === "hi"
              ? "दर्शन व्यवस्था, दान सेवा, अथवा विशेष अनुष्ठान संबंधी किसी भी सहायता हेतु ट्रस्ट कार्यालय से संपर्क करें।"
              : "Our sevadars and priests are here to assist you with pilgrimage planning, seva bookings, and donation inquiries."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Contact Details Card */}
          <div className="md:col-span-5 bg-[#5C0A0C] text-white rounded-2xl p-8 space-y-6 shadow-xl border-2 border-[#E58A13]">
            <h2 className="font-serif font-bold text-xl text-[#FDE68A]">
              Temple Trust Head Office
            </h2>

            <div className="space-y-4 text-xs text-amber-100/90 leading-relaxed">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-[#F59E0B] shrink-0 mt-0.5" />
                <span>
                  <strong>Shri Ram Janmabhoomi & Mahadev Mandir</strong><br />
                  Ramkot, Ayodhya Dham, Uttar Pradesh - 224123, India
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-[#F59E0B] shrink-0" />
                <span>+91 5278 297 108 / +91 98765 00000</span>
              </div>

              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-[#F59E0B] shrink-0" />
                <span>sevadar@shrirammandirtrust.org</span>
              </div>

              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-[#F59E0B] shrink-0 mt-0.5" />
                <span>
                  Office Hours: 08:00 AM to 08:00 PM Daily<br />
                  (Open on all Sundays & Ekadashi Festivals)
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 text-xs text-amber-200/80">
              <p>Nearest Railway Station: Ayodhya Dham Junction (2.5 km)</p>
              <p className="mt-1">Nearest Airport: Maharishi Valmiki International Airport, Ayodhya (9 km)</p>
            </div>
          </div>

          {/* Devotee Inquiry Form */}
          <div className="md:col-span-7 bg-white rounded-2xl p-8 shadow-sm border border-amber-200">
            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="font-serif font-bold text-xl text-slate-900">
                  Message Sent to Mandir Office
                </h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Thank you for reaching out. A temple sevadar will review your inquiry and connect with you shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-5 py-2 bg-[#7B1113] text-white text-xs font-bold rounded-xl"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <h2 className="font-serif font-bold text-lg text-[#7B1113] border-b pb-2">
                  Devotee Inquiry & Assistance Form
                </h2>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Radheshyam Gupta"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-[#E58A13]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-[#E58A13]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Inquiry Purpose *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Special Darshan Queue on Ram Navami"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-[#E58A13]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Message Details</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Write your questions regarding darshan, sevas, or accommodation..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-[#E58A13]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#7B1113] hover:bg-[#9B1C1E] text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 shadow"
                >
                  <Send className="w-4 h-4 text-amber-300" />
                  <span>Send Devotee Inquiry</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
