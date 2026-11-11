"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/language-context";
import { MapPin, Phone, Mail, Clock, ShieldCheck, Heart, Sparkles } from "lucide-react";

export const Footer: React.FC = () => {
  const { lang, t } = useLanguage();
  const pathname = usePathname();

  // Hide on admin routes
  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="bg-[#420708] text-amber-100/90 border-t-4 border-[#E58A13]">
      {/* Top Auspicious Floral Border */}
      <div className="bg-gradient-to-r from-[#E58A13] via-[#F59E0B] to-[#E58A13] h-1.5 w-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Col 1: Temple Branding & Trust */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-[#E58A13] flex items-center justify-center text-slate-900 font-serif text-xl font-bold shadow">
                ॐ
              </div>
              <span className="font-serif font-bold text-lg text-white">
                {lang === "hi" ? "श्री राम एवं महादेव मंदिर" : "Shri Ram & Mahadev Mandir"}
              </span>
            </div>
            <p className="text-xs text-amber-200/80 leading-relaxed">
              {lang === "hi"
                ? "श्री राम महादेव मंदिर चैरिटेबल ट्रस्ट (पंजीकृत) के तत्वावधान में संचालित। दैनिक दर्शन, वैदिक अनुष्ठान एवं नित्य अन्नदान सेवा।"
                : "Governed under the Shri Ram Mahadev Mandir Charitable Trust (Regd. No. TRUST/UP/AYD/2020/00482). Dedicated to Sanatana Dharma, daily darshan, Annadan feeding, and cultural preservation."}
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded bg-[#E58A13]/20 text-[#FDE68A] text-[11px] font-medium border border-[#E58A13]/30">
                <ShieldCheck className="w-3.5 h-3.5 mr-1 text-[#F59E0B]" />
                {lang === "hi" ? "80G आयकर छूट स्वीकृत" : "80G Tax Exemption Approved"}
              </span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h3 className="font-serif font-bold text-white text-sm uppercase tracking-wider mb-4 border-b border-[#E58A13]/40 pb-1.5 flex items-center space-x-2">
              <Sparkles className="w-3.5 h-3.5 text-[#E58A13]" />
              <span>{t("footer.quickLinks")}</span>
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/darshan-timings" className="hover:text-white transition-colors">
                  {lang === "hi" ? "दैनिक आरती एवं दर्शन समय" : "Daily Aarti & Darshan Schedule"}
                </Link>
              </li>
              <li>
                <Link href="/donations" className="hover:text-white transition-colors">
                  {lang === "hi" ? "ऑनलाइन दान एवं ई-रसीद" : "Online Donations & 80G Receipts"}
                </Link>
              </li>
              <li>
                <Link href="/store" className="hover:text-white transition-colors">
                  {lang === "hi" ? "मंदिर महाप्रसाद एवं साहित्य" : "Consecrated Prasad & Books Store"}
                </Link>
              </li>
              <li>
                <Link href="/sevas" className="hover:text-white transition-colors">
                  {lang === "hi" ? "पूजा एवं अनुष्ठान बुकिंग" : "Book Pujas & Vedic Abhishek"}
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-white transition-colors">
                  {lang === "hi" ? "आगामी उत्सव एवं त्योहार" : "Upcoming Festivals & Ceremonies"}
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-white transition-colors">
                  {lang === "hi" ? "भव्य चित्रशाला" : "Temple Photo & Video Gallery"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Darshan & Aarti Timings */}
          <div>
            <h3 className="font-serif font-bold text-white text-sm uppercase tracking-wider mb-4 border-b border-[#E58A13]/40 pb-1.5 flex items-center space-x-2">
              <Clock className="w-3.5 h-3.5 text-[#E58A13]" />
              <span>{lang === "hi" ? "दैनिक आरती समय" : "Aarti Timings"}</span>
            </h3>
            <ul className="space-y-2 text-xs">
              <li className="flex justify-between py-1 border-b border-white/5">
                <span>{lang === "hi" ? "मंगला आरती:" : "Mangala Aarti:"}</span>
                <span className="font-semibold text-amber-300">05:00 AM</span>
              </li>
              <li className="flex justify-between py-1 border-b border-white/5">
                <span>{lang === "hi" ? "शृंगार आरती:" : "Shringar Aarti:"}</span>
                <span className="font-semibold text-amber-300">06:30 AM</span>
              </li>
              <li className="flex justify-between py-1 border-b border-white/5">
                <span>{lang === "hi" ? "राजभोग आरती:" : "Bhog Aarti:"}</span>
                <span className="font-semibold text-amber-300">12:00 PM</span>
              </li>
              <li className="flex justify-between py-1 border-b border-white/5">
                <span>{lang === "hi" ? "संध्या आरती:" : "Sandhya Aarti:"}</span>
                <span className="font-semibold text-amber-300">07:00 PM</span>
              </li>
              <li className="flex justify-between py-1">
                <span>{lang === "hi" ? "शयन आरती:" : "Shayan Aarti:"}</span>
                <span className="font-semibold text-amber-300">09:30 PM</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Location */}
          <div>
            <h3 className="font-serif font-bold text-white text-sm uppercase tracking-wider mb-4 border-b border-[#E58A13]/40 pb-1.5 flex items-center space-x-2">
              <MapPin className="w-3.5 h-3.5 text-[#E58A13]" />
              <span>{t("footer.contactInfo")}</span>
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
                <span>Ramkot, Ayodhya Dham, Uttar Pradesh - 224123, India</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Phone className="w-4 h-4 text-[#F59E0B] shrink-0" />
                <span>+91 5278 297 108 / +91 98765 00000</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Mail className="w-4 h-4 text-[#F59E0B] shrink-0" />
                <span>sevadar@shrirammandirtrust.org</span>
              </div>
              <div className="pt-2">
                <Link
                  href="/admin/login"
                  className="inline-block text-[11px] text-amber-300/80 hover:text-white underline"
                >
                  {t("nav.adminLogin")} &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center text-xs text-amber-200/60 space-y-3 sm:space-y-0">
          <div>
            © 2026 Shri Ram Janmabhoomi & Mahadev Mandir Trust. {t("footer.rights")}
          </div>
          <div className="flex space-x-4">
            <Link href="/about" className="hover:text-white">About Trust</Link>
            <Link href="/contact" className="hover:text-white">Contact</Link>
            <Link href="/admin/login" className="hover:text-white">Staff Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
