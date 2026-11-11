"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Heart,
  ShoppingBag,
  ClipboardList,
  Flame,
  Coins,
  Image as ImageIcon,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // If on /admin/login, don't protect
    if (pathname === "/admin/login") {
      setLoading(false);
      return;
    }

    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (!data.user) {
          router.push("/admin/login");
        } else {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {
        router.push("/admin/login");
      })
      .finally(() => setLoading(false));
  }, [pathname, router]);

  // If on login page, render children directly without admin layout chrome
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#3D0607] flex items-center justify-center text-amber-200 font-serif">
        Validating Administrative Session...
      </div>
    );
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const navItems = [
    { href: "/admin", label: "Dashboard Overview", icon: LayoutDashboard, permission: "all" },
    { href: "/admin/donations", label: "Donations & Receipts", icon: Heart, permission: "donations:read" },
    { href: "/admin/store", label: "Prasad Store & Orders", icon: ShoppingBag, permission: "store:read" },
    { href: "/admin/inventory", label: "Inventory & Supplies", icon: ClipboardList, permission: "inventory:read" },
    { href: "/admin/sevas", label: "Seva Slots & Roster", icon: Flame, permission: "sevas:read" },
    { href: "/admin/finance", label: "Accounts & Financials", icon: Coins, permission: "finance:read" },
    { href: "/admin/content", label: "Content, Events & Gallery", icon: ImageIcon, permission: "events:read" },
    { href: "/admin/staff", label: "Staff & Access Roles", icon: Users, permission: "super_admin_only" },
    { href: "/admin/settings", label: "Temple Settings", icon: Settings, permission: "super_admin_only" },
  ];

  const filteredNavItems = navItems.filter((item) => {
    if (!currentUser) return false;
    if (currentUser.role === "SUPER_ADMIN") return true;
    if (item.permission === "super_admin_only") return false;
    if (item.permission === "all") return true;
    return true; // allow other modules
  });

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-[#5C0A0C] text-white p-4 flex justify-between items-center border-b border-[#E58A13]">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-[#E58A13] flex items-center justify-center text-slate-900 font-serif font-bold">
            ॐ
          </div>
          <span className="font-serif font-bold text-sm text-[#FDE68A]">TMS Admin</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 rounded-lg bg-white/10 text-white"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Admin Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "block" : "hidden"
        } md:block w-full md:w-64 bg-[#5C0A0C] text-amber-100 flex-shrink-0 border-r border-[#E58A13]/40 flex flex-col justify-between`}
      >
        <div>
          {/* Sidebar Brand Header */}
          <div className="p-6 border-b border-white/10 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#E58A13] to-[#F59E0B] flex items-center justify-center text-slate-950 font-serif text-xl font-bold shadow">
              ॐ
            </div>
            <div>
              <span className="font-serif font-bold text-sm text-white block">
                Temple Operations
              </span>
              <span className="text-[10px] text-amber-300 font-mono tracking-wider block">
                ADMINISTRATION PANEL
              </span>
            </div>
          </div>

          {/* Nav List */}
          <nav className="p-3 space-y-1">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-[#E58A13] text-slate-950 font-bold shadow-md"
                      : "text-amber-100 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer User Info & Logout */}
        <div className="p-4 border-t border-white/10 space-y-3 bg-black/20">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 text-[#FDE68A] flex items-center justify-center font-bold text-xs border border-amber-400">
              {currentUser?.name?.charAt(0) || "U"}
            </div>
            <div className="truncate">
              <span className="text-xs font-bold text-white block truncate">
                {currentUser?.name}
              </span>
              <span className="text-[10px] font-mono text-amber-300 block truncate">
                {currentUser?.role}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
            <Link
              href="/"
              target="_blank"
              className="text-amber-200/80 hover:text-white flex items-center space-x-1"
            >
              <span>View Portal</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <button
              onClick={handleLogout}
              className="text-red-400 hover:text-red-300 font-bold flex items-center space-x-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 overflow-y-auto min-h-screen p-4 sm:p-8 lg:p-10">
        {children}
      </main>
    </div>
  );
}
