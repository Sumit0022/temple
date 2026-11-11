"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/language-context";
import { useCart } from "@/lib/cart-context";
import {
  Sparkles,
  ShoppingBag,
  User,
  Menu,
  X,
  Globe,
  Heart,
  Calendar,
  Clock,
  ShieldCheck,
} from "lucide-react";

export const Navbar: React.FC = () => {
  const { lang, setLang, t } = useLanguage();
  const { totalItems } = useCart();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [devoteeUser, setDevoteeUser] = useState<any>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.devotee) setDevoteeUser(data.devotee);
      })
      .catch(() => {});
  }, [pathname]);

  // Don't show public navbar inside /admin routes
  if (pathname.startsWith("/admin")) {
    return null;
  }

  const navLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/darshan-timings", label: t("nav.darshan") },
    { href: "/donations", label: t("nav.donations") },
    { href: "/store", label: t("nav.prasad") },
    { href: "/sevas", label: t("nav.sevas") },
    { href: "/events", label: t("nav.events") },
    { href: "/gallery", label: t("nav.gallery") },
    { href: "/about", label: t("nav.about") },
  ];

  return (
    <header className="sticky top-0 z-50 shadow-md">
      {/* Top Auspicious Ticker & Language Switcher */}
      <div className="bg-[#5C0A0C] text-[#FDE68A] text-xs px-4 py-1.5 flex justify-between items-center border-b border-[#E58A13]/30">
        <div className="flex items-center space-x-2 truncate">
          <Sparkles className="w-3.5 h-3.5 text-[#F59E0B] animate-pulse shrink-0" />
          <span className="font-medium tracking-wide">
            {lang === "hi"
              ? "॥ ॐ नमो भगवते वासुदेवाय ॥ दैनिक दर्शन: प्रातः 05:00 से रात्रि 09:30 बजे तक"
              : "॥ Om Namo Bhagavate Vasudevaya ॥ Daily Darshan Open: 05:00 AM - 09:30 PM"}
          </span>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          {/* Language Switcher */}
          <button
            onClick={() => setLang(lang === "en" ? "hi" : "en")}
            className="flex items-center space-x-1 px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 transition-all text-white font-medium"
            title="Switch Language / भाषा बदलें"
          >
            <Globe className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>{lang === "en" ? "हिंदी" : "English"}</span>
          </button>

          {/* Staff Login Link */}
          <Link
            href="/admin/login"
            className="text-xs hover:text-white flex items-center space-x-1 text-amber-200/80 transition-colors"
          >
            <ShieldCheck className="w-3 h-3" />
            <span className="hidden sm:inline">{t("nav.adminLogin")}</span>
          </Link>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className="bg-[#7B1113] text-white border-b-2 border-[#E58A13]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            {/* Temple Brand & Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#E58A13] to-[#F59E0B] flex items-center justify-center shadow-lg border-2 border-white/30 text-white font-serif text-2xl font-bold">
                ॐ
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-lg sm:text-xl tracking-tight text-[#FEF3C7] group-hover:text-white transition-colors leading-tight">
                  {lang === "hi" ? "श्री राम एवं महादेव मंदिर" : "Shri Ram & Mahadev Mandir"}
                </span>
                <span className="text-[11px] text-amber-200/90 font-medium tracking-wide">
                  {lang === "hi" ? "अयोध्या धाम, भारत" : "Ayodhya Dham, India"}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      isActive
                        ? "bg-[#E58A13] text-slate-900 font-semibold shadow"
                        : "text-amber-100 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Right Action Icons (Cart, Devotee Profile, Quick Donate) */}
            <div className="hidden sm:flex items-center space-x-3">
              {/* Cart Button */}
              <Link
                href="/cart"
                className="relative p-2 rounded-full bg-black/20 hover:bg-black/30 transition-colors text-amber-100 hover:text-white"
                title="View Prasad Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#E58A13] text-slate-900 font-bold text-[11px] w-5 h-5 rounded-full flex items-center justify-center shadow border border-white">
                    {totalItems}
                  </span>
                )}
              </Link>

              {/* Devotee Account */}
              <Link
                href="/devotee"
                className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-amber-100 transition-colors"
              >
                <User className="w-4 h-4 text-[#F59E0B]" />
                <span>{devoteeUser ? devoteeUser.name.split(" ")[0] : t("nav.devoteeLogin")}</span>
              </Link>

              {/* Quick Donation CTA Pill */}
              <Link
                href="/donations"
                className="flex items-center space-x-1.5 bg-gradient-to-r from-[#E58A13] to-[#F59E0B] text-slate-950 px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-md transition-all active:scale-95"
              >
                <Heart className="w-3.5 h-3.5 fill-current text-red-700" />
                <span>{t("nav.donateNow")}</span>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex lg:hidden items-center space-x-2">
              <Link
                href="/cart"
                className="relative p-2 rounded-full bg-black/20 text-amber-100"
              >
                <ShoppingBag className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#E58A13] text-slate-900 font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-amber-100 hover:text-white hover:bg-white/10 focus:outline-none"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#5C0A0C] border-t border-[#E58A13]/30 px-4 pt-2 pb-5 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2.5 rounded-md text-base font-medium ${
                  pathname === link.href
                    ? "bg-[#E58A13] text-slate-900 font-bold"
                    : "text-amber-100 hover:bg-white/10"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-4 border-t border-white/10 flex flex-col space-y-2">
              <Link
                href="/donations"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 bg-[#E58A13] text-slate-950 font-bold rounded-lg shadow"
              >
                {t("nav.donateNow")}
              </Link>
              <Link
                href="/devotee"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 bg-white/10 text-white font-medium rounded-lg text-sm"
              >
                {t("nav.devoteeLogin")}
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
