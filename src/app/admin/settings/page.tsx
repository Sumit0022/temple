"use client";

import React, { useState, useEffect } from "react";
import { Settings, Save, ShieldCheck, Building, Phone, Clock, CreditCard } from "lucide-react";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.settingsMap) setSettings(d.settingsMap);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Temple configurations updated successfully.");
      } else {
        alert(data.error || "Failed to update settings");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500 font-serif">
        Loading temple configurations...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold text-[#E58A13] uppercase tracking-wider">
            System Administration
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#7B1113]">
            Temple Identity & Configuration Settings
          </h1>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 bg-[#7B1113] hover:bg-[#9B1C1E] text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "Saving Changes..." : "Save Settings"}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Identity */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 space-y-4">
          <h2 className="font-serif font-bold text-base text-slate-900 border-b pb-2 flex items-center space-x-2">
            <Building className="w-4 h-4 text-[#E58A13]" />
            <span>Temple & Trust Legal Identity</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Temple Name (English)</label>
              <input
                type="text"
                value={settings.TEMPLE_NAME || ""}
                onChange={(e) => handleChange("TEMPLE_NAME", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Temple Name (Hindi)</label>
              <input
                type="text"
                value={settings.TEMPLE_NAME_HI || ""}
                onChange={(e) => handleChange("TEMPLE_NAME_HI", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Registered Legal Trust Name</label>
              <input
                type="text"
                value={settings.TEMPLE_TRUST_NAME || ""}
                onChange={(e) => handleChange("TEMPLE_TRUST_NAME", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Trust Registration Number</label>
              <input
                type="text"
                value={settings.TRUST_REG_NUMBER || ""}
                onChange={(e) => handleChange("TRUST_REG_NUMBER", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* 80G Tax Exemption Settings */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 space-y-4">
          <h2 className="font-serif font-bold text-base text-slate-900 border-b pb-2 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>80G Income Tax Exemption Configuration</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">80G Tax Exemption Active</label>
              <select
                value={settings.ENABLE_80G_TAX_EXEMPTION || "true"}
                onChange={(e) => handleChange("ENABLE_80G_TAX_EXEMPTION", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg outline-none bg-white font-bold"
              >
                <option value="true">Enabled (Print 80G Clause on Receipts)</option>
                <option value="false">Disabled</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Income Tax 80G Order Number</label>
              <input
                type="text"
                value={settings.TAX_80G_REG_NUMBER || ""}
                onChange={(e) => handleChange("TAX_80G_REG_NUMBER", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Payment Gateway (Razorpay) Configuration */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 space-y-4">
          <h2 className="font-serif font-bold text-base text-slate-900 border-b pb-2 flex items-center space-x-2">
            <CreditCard className="w-4 h-4 text-[#7B1113]" />
            <span>Razorpay Payment Gateway Integration</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Razorpay Key ID</label>
              <input
                type="text"
                value={settings.RAZORPAY_KEY_ID || "rzp_test_TymkbKigVMfger"}
                onChange={(e) => handleChange("RAZORPAY_KEY_ID", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg outline-none font-mono"
                placeholder="rzp_test_..."
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Razorpay Key Secret</label>
              <input
                type="password"
                value={settings.RAZORPAY_KEY_SECRET || "v7pe5P9X99Gb9Jpq0lpi4ok7"}
                onChange={(e) => handleChange("RAZORPAY_KEY_SECRET", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg outline-none font-mono"
                placeholder="Key Secret"
              />
            </div>
          </div>
        </div>

        {/* Darshan & Aarti Timings */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 space-y-4">
          <h2 className="font-serif font-bold text-base text-slate-900 border-b pb-2 flex items-center space-x-2">
            <Clock className="w-4 h-4 text-[#E58A13]" />
            <span>Aarti & Visiting Hours</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Mangala Aarti</label>
              <input
                type="text"
                value={settings.MANGALA_AARTI_TIME || "05:00 AM"}
                onChange={(e) => handleChange("MANGALA_AARTI_TIME", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg outline-none font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Shringar Aarti</label>
              <input
                type="text"
                value={settings.SHRINGAR_AARTI_TIME || "06:30 AM"}
                onChange={(e) => handleChange("SHRINGAR_AARTI_TIME", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg outline-none font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Rajbhog Aarti</label>
              <input
                type="text"
                value={settings.BHOG_AARTI_TIME || "12:00 PM"}
                onChange={(e) => handleChange("BHOG_AARTI_TIME", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg outline-none font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Sandhya Aarti</label>
              <input
                type="text"
                value={settings.SANDHYA_AARTI_TIME || "07:00 PM"}
                onChange={(e) => handleChange("SANDHYA_AARTI_TIME", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg outline-none font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Shayan Aarti</label>
              <input
                type="text"
                value={settings.SHAYAN_AARTI_TIME || "09:30 PM"}
                onChange={(e) => handleChange("SHAYAN_AARTI_TIME", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Contact Details */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 space-y-4">
          <h2 className="font-serif font-bold text-base text-slate-900 border-b pb-2 flex items-center space-x-2">
            <Phone className="w-4 h-4 text-[#E58A13]" />
            <span>Official Inquiries & Location</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Helpline Phone</label>
              <input
                type="text"
                value={settings.CONTACT_PHONE || ""}
                onChange={(e) => handleChange("CONTACT_PHONE", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Official Email</label>
              <input
                type="email"
                value={settings.CONTACT_EMAIL || ""}
                onChange={(e) => handleChange("CONTACT_EMAIL", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">WhatsApp Support</label>
              <input
                type="text"
                value={settings.CONTACT_WHATSAPP || ""}
                onChange={(e) => handleChange("CONTACT_WHATSAPP", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg outline-none"
              />
            </div>
            <div className="sm:col-span-3">
              <label className="block font-semibold text-slate-700 mb-1">Physical Temple Address</label>
              <input
                type="text"
                value={settings.TEMPLE_ADDRESS || ""}
                onChange={(e) => handleChange("TEMPLE_ADDRESS", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg outline-none"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
