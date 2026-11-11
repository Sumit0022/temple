"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/lib/language-context";
import { Sparkles, Image as ImageIcon, X, ChevronLeft, ChevronRight } from "lucide-react";

export default function GalleryPage() {
  const { lang, t } = useLanguage();
  const [albums, setAlbums] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/content/gallery")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setAlbums(data);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="py-12 bg-[#FDFBF7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center space-y-3 pb-4 border-b border-amber-200">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-[#7B1113] text-xs font-semibold">
            <ImageIcon className="w-3.5 h-3.5 text-[#E58A13]" />
            <span>{lang === "hi" ? "दिव्य दर्शन चित्रशाला" : "Sanctum Photo Gallery"}</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#7B1113]">
            {lang === "hi" ? "मंदिर भव्य चित्रशाला एवं दर्शन" : "Sacred Photo & Video Gallery"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
            {lang === "hi"
              ? "दैनिक आरती, भव्य दीपोत्सव, नित्य अन्नदान एवं मंदिर स्थापत्य के अलौकिक दर्शन।"
              : "Witness glimpses of morning shringar, evening deepa aartis, community Annadan feeding, and grand festivals."}
          </p>
        </div>

        {/* Albums & Photos */}
        <div className="space-y-12">
          {albums.map((album) => (
            <div key={album.id} className="space-y-6">
              <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                <div>
                  <h2 className="font-serif font-bold text-xl sm:text-2xl text-[#7B1113]">
                    {lang === "hi" ? album.titleHi : album.title}
                  </h2>
                  {album.description && (
                    <p className="text-xs text-slate-500 mt-0.5">{album.description}</p>
                  )}
                </div>
                <span className="text-xs font-semibold text-[#E58A13] bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  {album.category}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {(album.mediaAssets || []).map((asset: any) => (
                  <div
                    key={asset.id}
                    onClick={() => setSelectedImage(asset.url)}
                    className="group relative h-64 rounded-2xl overflow-hidden bg-slate-900 shadow-sm border border-amber-200/60 cursor-pointer"
                  >
                    <img
                      src={asset.url}
                      alt={asset.title || "Mandir Photo"}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 text-white">
                      <h3 className="font-serif font-bold text-sm text-[#FDE68A]">
                        {asset.title}
                      </h3>
                      {asset.caption && (
                        <p className="text-[11px] text-amber-100/80 mt-1 line-clamp-2">
                          {asset.caption}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox Modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh]">
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-10 right-0 text-white hover:text-amber-300 p-2"
              >
                <X className="w-8 h-8" />
              </button>
              <img
                src={selectedImage}
                alt="Enlarged view"
                className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl border-2 border-amber-400"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
