"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Image as ImageIcon,
  Bell,
  Plus,
  Sparkles,
  CheckCircle,
  X,
  Trash2,
} from "lucide-react";

export default function AdminContentPage() {
  const [activeTab, setActiveTab] = useState<"events" | "announcements" | "gallery">("events");
  const [events, setEvents] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);

  // Event modal
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [evTitle, setEvTitle] = useState("");
  const [evTitleHi, setEvTitleHi] = useState("");
  const [evDesc, setEvDesc] = useState("");
  const [evBanner, setEvBanner] = useState("");
  const [evStart, setEvStart] = useState("");
  const [evEnd, setEvEnd] = useState("");
  const [evLoc, setEvLoc] = useState("");

  // Announcement modal
  const [annoModalOpen, setAnnoModalOpen] = useState(false);
  const [anTitle, setAnTitle] = useState("");
  const [anMessage, setAnMessage] = useState("");
  const [anType, setAnType] = useState("INFO");
  const [anBanner, setAnBanner] = useState(true);

  // Gallery modal
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [albTitle, setAlbTitle] = useState("");
  const [albCat, setAlbCat] = useState("FESTIVAL");
  const [albDesc, setAlbDesc] = useState("");
  const [albPhotoUrl, setAlbPhotoUrl] = useState("");

  const fetchData = async () => {
    try {
      const [evRes, anRes, galRes] = await Promise.all([
        fetch("/api/content/events"),
        fetch("/api/content/announcements"),
        fetch("/api/content/gallery"),
      ]);
      const evData = await evRes.json();
      const anData = await anRes.json();
      const galData = await galRes.json();

      if (Array.isArray(evData)) setEvents(evData);
      if (Array.isArray(anData)) setAnnouncements(anData);
      if (Array.isArray(galData)) setAlbums(galData);
    } catch (e) {}
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/content/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: evTitle,
          titleHi: evTitleHi,
          description: evDesc,
          bannerImage: evBanner,
          startDate: evStart,
          endDate: evEnd,
          location: evLoc,
        }),
      });

      if (res.ok) {
        alert("Festival event published!");
        setEventModalOpen(false);
        setEvTitle("");
        fetchData();
      }
    } catch (err) {
      alert("Failed to create event");
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/content/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: anTitle,
          message: anMessage,
          type: anType,
          isBanner: anBanner,
        }),
      });

      if (res.ok) {
        alert("Announcement posted!");
        setAnnoModalOpen(false);
        setAnTitle("");
        setAnMessage("");
        fetchData();
      }
    } catch (err) {
      alert("Failed to create announcement");
    }
  };

  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/content/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: albTitle,
          category: albCat,
          description: albDesc,
          mediaUrls: [albPhotoUrl],
        }),
      });

      if (res.ok) {
        alert("Gallery album created!");
        setGalleryModalOpen(false);
        setAlbTitle("");
        fetchData();
      }
    } catch (err) {
      alert("Failed to create album");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold text-[#E58A13] uppercase tracking-wider">
            Public Content & Communications CMS
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#7B1113]">
            Festivals, Gallery & Announcements CMS
          </h1>
        </div>

        <div className="flex space-x-2">
          {activeTab === "events" && (
            <button
              onClick={() => setEventModalOpen(true)}
              className="px-4 py-2 bg-[#7B1113] hover:bg-[#9B1C1E] text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Publish Festival</span>
            </button>
          )}

          {activeTab === "announcements" && (
            <button
              onClick={() => setAnnoModalOpen(true)}
              className="px-4 py-2 bg-[#7B1113] hover:bg-[#9B1C1E] text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Post Notice</span>
            </button>
          )}

          {activeTab === "gallery" && (
            <button
              onClick={() => setGalleryModalOpen(true)}
              className="px-4 py-2 bg-[#7B1113] hover:bg-[#9B1C1E] text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Album</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-2">
        <button
          onClick={() => setActiveTab("events")}
          className={`px-5 py-2.5 font-serif font-bold text-xs border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === "events"
              ? "border-[#7B1113] text-[#7B1113]"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Festivals & Events ({events.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("announcements")}
          className={`px-5 py-2.5 font-serif font-bold text-xs border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === "announcements"
              ? "border-[#7B1113] text-[#7B1113]"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Announcements & Ticker ({announcements.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("gallery")}
          className={`px-5 py-2.5 font-serif font-bold text-xs border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === "gallery"
              ? "border-[#7B1113] text-[#7B1113]"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Photo Gallery Albums ({albums.length})</span>
        </button>
      </div>

      {/* TAB 1: FESTIVALS & EVENTS */}
      {activeTab === "events" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((ev) => (
            <div key={ev.id} className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden flex flex-col justify-between">
              <div>
                <img src={ev.bannerImage} alt={ev.title} className="w-full h-40 object-cover" />
                <div className="p-4 space-y-2">
                  <span className="text-[10px] text-amber-700 font-bold uppercase">{ev.location}</span>
                  <h3 className="font-serif font-bold text-base text-slate-900">{ev.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2">{ev.description}</p>
                </div>
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-600 font-mono">
                {new Date(ev.startDate).toLocaleDateString("en-IN")}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: ANNOUNCEMENTS */}
      {activeTab === "announcements" && (
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden divide-y divide-slate-100">
          {announcements.map((an) => (
            <div key={an.id} className="p-5 flex items-start justify-between gap-4 text-xs">
              <div>
                <span className="font-bold text-[#7B1113] uppercase tracking-wider block">{an.title}</span>
                <p className="text-slate-700 mt-1 font-medium">{an.message}</p>
                <span className="text-[10px] text-slate-400 mt-2 block font-mono">
                  Posted: {new Date(an.createdAt).toLocaleDateString("en-IN")}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 shrink-0">
                {an.type}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: GALLERY ALBUMS */}
      {activeTab === "gallery" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {albums.map((alb) => (
            <div key={alb.id} className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden p-4 space-y-3">
              <img src={alb.coverImage || (alb.mediaAssets && alb.mediaAssets[0]?.url)} alt={alb.title} className="w-full h-44 object-cover rounded-xl" />
              <div>
                <span className="text-[10px] font-bold text-[#E58A13] uppercase">{alb.category}</span>
                <h3 className="font-serif font-bold text-base text-slate-900 mt-0.5">{alb.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{alb.mediaAssets?.length || 0} Photos</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Event Modal */}
      {eventModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 relative shadow-2xl border border-amber-300 max-h-[92vh] overflow-y-auto">
            <button onClick={() => setEventModalOpen(false)} className="absolute top-4 right-4 p-1 text-slate-500">
              <X className="w-6 h-6" />
            </button>
            <h2 className="font-serif font-bold text-xl text-[#7B1113] border-b pb-3 mb-4">Publish Festival Event</h2>
            <form onSubmit={handleCreateEvent} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shri Ram Navami Janmotsav"
                  value={evTitle}
                  onChange={(e) => setEvTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Date *</label>
                  <input
                    type="datetime-local"
                    required
                    value={evStart}
                    onChange={(e) => setEvStart(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End Date *</label>
                  <input
                    type="datetime-local"
                    required
                    value={evEnd}
                    onChange={(e) => setEvEnd(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  value={evLoc}
                  onChange={(e) => setEvLoc(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Banner Image URL</label>
                <input
                  type="url"
                  value={evBanner}
                  onChange={(e) => setEvBanner(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={evDesc}
                  onChange={(e) => setEvDesc(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg outline-none"
                />
              </div>
              <button type="submit" className="w-full py-3 bg-[#7B1113] text-white font-bold rounded-xl uppercase">
                Publish Event
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Create Announcement Modal */}
      {annoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 relative shadow-2xl border border-amber-300">
            <button onClick={() => setAnnoModalOpen(false)} className="absolute top-4 right-4 p-1 text-slate-500">
              <X className="w-5 h-5" />
            </button>
            <h2 className="font-serif font-bold text-lg text-[#7B1113] border-b pb-2 mb-4">Post Announcement Notice</h2>
            <form onSubmit={handleCreateAnnouncement} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Special Darshan Queue on Ekadashi"
                  value={anTitle}
                  onChange={(e) => setAnTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Message *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Notice message for devotees..."
                  value={anMessage}
                  onChange={(e) => setAnMessage(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg outline-none"
                />
              </div>
              <button type="submit" className="w-full py-3 bg-[#7B1113] text-white font-bold rounded-xl uppercase">
                Post Notice
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Create Album Modal */}
      {galleryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 relative shadow-2xl border border-amber-300">
            <button onClick={() => setGalleryModalOpen(false)} className="absolute top-4 right-4 p-1 text-slate-500">
              <X className="w-5 h-5" />
            </button>
            <h2 className="font-serif font-bold text-lg text-[#7B1113] border-b pb-2 mb-4">Create Photo Album</h2>
            <form onSubmit={handleCreateAlbum} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Album Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kartik Deepotsav Sanctum"
                  value={albTitle}
                  onChange={(e) => setAlbTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={albCat}
                  onChange={(e) => setAlbCat(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg outline-none bg-white"
                >
                  <option value="FESTIVAL">FESTIVAL</option>
                  <option value="DAILY_DARSHAN">DAILY DARSHAN</option>
                  <option value="RITUAL">RITUAL</option>
                  <option value="CHARITY">CHARITY & ANNADAN</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Photo URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/photo-..."
                  value={albPhotoUrl}
                  onChange={(e) => setAlbPhotoUrl(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg outline-none"
                />
              </div>
              <button type="submit" className="w-full py-3 bg-[#7B1113] text-white font-bold rounded-xl uppercase">
                Save Album
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
