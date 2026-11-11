"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/lib/language-context";
import Link from "next/link";
import { Calendar, Clock, MapPin, Sparkles, Users, CheckCircle2 } from "lucide-react";

export default function EventsPage() {
  const { lang, t } = useLanguage();
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/content/events")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setEvents(data);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="py-12 bg-[#FDFBF7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="text-center space-y-3 pb-4 border-b border-amber-200">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-[#7B1113] text-xs font-semibold">
            <Calendar className="w-3.5 h-3.5 text-[#E58A13]" />
            <span>{lang === "hi" ? "उत्सव एवं धार्मिक पर्व" : "Temple Festival Calendar"}</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#7B1113]">
            {lang === "hi" ? "आगामी धार्मिक महोत्सव एवं पर्व" : "Grand Temple Festivals & Celebrations"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
            {lang === "hi"
              ? "सनातन वैदिक परंपरा के पावन पर्वों में सम्मिलित होकर प्रभु के अलौकिक दर्शन एवं आशीर्वाद प्राप्त करें।"
              : "Participate in celestial celebrations, grand aartis, cultural bhajan sandhyas, and chariot processions."}
          </p>
        </div>

        {/* Events Grid */}
        <div className="space-y-8">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="bg-white rounded-2xl shadow-md border border-amber-200/80 overflow-hidden grid grid-cols-1 md:grid-cols-12 gap-0 hover:shadow-xl transition-all"
            >
              {/* Banner Image */}
              <div className="md:col-span-5 relative h-64 md:h-auto bg-slate-900">
                <img
                  src={ev.bannerImage || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&auto=format&fit=crop&q=80"}
                  alt={ev.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-[#7B1113] text-amber-200 text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg">
                  {new Date(ev.startDate).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              </div>

              {/* Event Content */}
              <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center space-x-2 text-xs text-[#E58A13] font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Annual Maha Utsav</span>
                  </div>

                  <h2 className="font-serif font-bold text-xl sm:text-2xl text-slate-900 mt-1">
                    {lang === "hi" ? ev.titleHi : ev.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed">
                    {lang === "hi" && ev.descriptionHi ? ev.descriptionHi : ev.description}
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-[#E58A13] shrink-0" />
                    <span>
                      {new Date(ev.startDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} onwards
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-[#E58A13] shrink-0" />
                    <span>{ev.location}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center space-x-4">
                  <Link
                    href="/sevas"
                    className="px-5 py-2.5 bg-[#7B1113] hover:bg-[#9B1C1E] text-white font-bold rounded-xl text-xs shadow transition-colors"
                  >
                    Book Festival Seva
                  </Link>
                  <Link
                    href="/donations"
                    className="px-5 py-2.5 bg-amber-100 hover:bg-amber-200 text-[#7B1113] font-bold rounded-xl text-xs transition-colors"
                  >
                    Contribute Festival Fund
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
