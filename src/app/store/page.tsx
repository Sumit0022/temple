"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/lib/language-context";
import { useCart } from "@/lib/cart-context";
import { parseImages } from "@/lib/utils";
import Link from "next/link";
import {
  ShoppingBag,
  Search,
  Filter,
  Check,
  Utensils,
  BookOpen,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  X,
} from "lucide-react";

export default function StorePage() {
  const { lang, t } = useLanguage();
  const { addToCart, totalItems } = useCart();

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [addedToast, setAddedToast] = useState<string>("");

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        if (data.products) setProducts(data.products);
        if (data.categories) setCategories(data.categories);
      })
      .catch(() => {});
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      activeCategory === "all" || p.category?.slug === activeCategory;
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.nameHi && p.nameHi.includes(searchQuery)) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (product: any) => {
    const images = parseImages(product.images);
    const imgUrl = images[0] || "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80";

    addToCart({
      id: product.id,
      name: product.name,
      nameHi: product.nameHi,
      slug: product.slug,
      price: product.price,
      salePrice: product.salePrice,
      image: imgUrl,
      weightGrams: product.weightGrams,
      isPrasad: product.isPrasad,
    });

    setAddedToast(`Added "${product.name}" to cart!`);
    setTimeout(() => setAddedToast(""), 3000);
  };

  return (
    <div className="py-12 bg-[#FDFBF7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Toast Notification */}
        {addedToast && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#7B1113] text-white px-5 py-3 rounded-xl shadow-2xl border border-amber-300 flex items-center space-x-3 animate-fade-in text-xs font-semibold">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{addedToast}</span>
            <Link
              href="/cart"
              className="ml-2 underline text-[#FDE68A] hover:text-white"
            >
              View Cart &rarr;
            </Link>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-amber-200">
          <div>
            <span className="text-xs font-bold text-[#E58A13] uppercase tracking-wider flex items-center space-x-1">
              <Utensils className="w-3.5 h-3.5" />
              <span>{lang === "hi" ? "मंदिर भंडार एवं प्रसाद" : "Sacred Prasad & Store"}</span>
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#7B1113] mt-1">
              {t("store.heading")}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mt-1">
              {t("store.sub")}
            </p>
          </div>

          <Link
            href="/cart"
            className="mt-4 md:mt-0 inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-[#E58A13] text-slate-950 font-bold text-xs shadow hover:brightness-110 transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>View Cart ({totalItems})</span>
          </Link>
        </div>

        {/* Category Filters & Search Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
          {/* Categories Pill Buttons */}
          <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                activeCategory === "all"
                  ? "bg-[#7B1113] text-white shadow"
                  : "bg-white text-slate-700 border border-slate-200 hover:border-amber-300"
              }`}
            >
              {lang === "hi" ? "सभी सामग्री" : "All Products"}
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.slug)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  activeCategory === c.slug
                    ? "bg-[#7B1113] text-white shadow"
                    : "bg-white text-slate-700 border border-slate-200 hover:border-amber-300"
                }`}
              >
                {lang === "hi" ? c.nameHi : c.name}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search prasad, samagri, books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-full text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-[#E58A13] outline-none"
            />
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center text-slate-500">
            <p className="font-serif text-lg">No products found matching your search.</p>
            <button
              onClick={() => {
                setActiveCategory("all");
                setSearchQuery("");
              }}
              className="mt-3 text-xs text-[#7B1113] underline font-bold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((prod) => {
              const images = parseImages(prod.images);
              const imgUrl = images[0] || "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80";

              return (
                <div
                  key={prod.id}
                  className="bg-white rounded-2xl shadow-sm border border-amber-200/60 overflow-hidden flex flex-col justify-between group hover:shadow-xl transition-all"
                >
                  <div
                    className="relative h-48 overflow-hidden bg-amber-50 cursor-pointer"
                    onClick={() => setSelectedProduct(prod)}
                  >
                    <img
                      src={imgUrl}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {prod.shelfLifeDays && (
                      <span className="absolute top-2 left-2 bg-[#7B1113] text-amber-200 text-[10px] font-bold px-2 py-0.5 rounded shadow">
                        Fresh {prod.shelfLifeDays} Days
                      </span>
                    )}
                    {prod.stockQuantity <= prod.minStockThreshold && prod.stockQuantity > 0 && (
                      <span className="absolute top-2 right-2 bg-amber-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded shadow">
                        Low Stock: {prod.stockQuantity} left
                      </span>
                    )}
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#E58A13]">
                        {prod.category?.name}
                      </span>
                      <h3
                        onClick={() => setSelectedProduct(prod)}
                        className="font-serif font-bold text-base text-slate-900 mt-1 cursor-pointer hover:text-[#7B1113] transition-colors line-clamp-2"
                      >
                        {lang === "hi" ? prod.nameHi : prod.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {lang === "hi" && prod.descriptionHi ? prod.descriptionHi : prod.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="font-serif font-bold text-lg text-[#7B1113]">
                          ₹{prod.salePrice || prod.price}
                        </span>
                        {prod.salePrice && (
                          <span className="text-xs text-slate-400 line-through ml-2">
                            ₹{prod.price}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleAddToCart(prod)}
                        className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#E58A13] to-[#F59E0B] text-slate-950 font-bold text-xs shadow hover:brightness-110 active:scale-95 transition-all flex items-center space-x-1.5"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{t("store.addToCart")}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Product Details Modal */}
        {selectedProduct && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 relative shadow-2xl border border-amber-300 max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start mt-2">
                <div className="rounded-xl overflow-hidden bg-amber-50 border border-amber-200">
                  <img
                    src={parseImages(selectedProduct.images)[0] || "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80"}
                    alt={selectedProduct.name}
                    className="w-full h-64 object-cover"
                  />
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-[#E58A13] tracking-wider">
                      {selectedProduct.category?.name}
                    </span>
                    <h2 className="font-serif font-bold text-xl text-slate-900 mt-1">
                      {lang === "hi" ? selectedProduct.nameHi : selectedProduct.name}
                    </h2>
                    <p className="font-mono text-[11px] text-slate-400 mt-0.5">
                      SKU: {selectedProduct.sku}
                    </p>
                  </div>

                  <p className="text-slate-600 leading-relaxed text-xs">
                    {lang === "hi" && selectedProduct.descriptionHi
                      ? selectedProduct.descriptionHi
                      : selectedProduct.description}
                  </p>

                  <div className="space-y-1.5 py-2 border-y border-slate-100">
                    {selectedProduct.weightGrams && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Weight:</span>
                        <span className="font-semibold text-slate-800">{selectedProduct.weightGrams}g</span>
                      </div>
                    )}
                    {selectedProduct.shelfLifeDays && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Shelf Life:</span>
                        <span className="font-semibold text-slate-800">{selectedProduct.shelfLifeDays} Days</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-500">Stock Availability:</span>
                      <span className="font-semibold text-emerald-700">
                        {selectedProduct.stockQuantity > 0 ? "In Stock" : "Out of Stock"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <span className="font-serif font-bold text-2xl text-[#7B1113]">
                        ₹{selectedProduct.salePrice || selectedProduct.price}
                      </span>
                      {selectedProduct.salePrice && (
                        <span className="text-xs text-slate-400 line-through ml-2">
                          ₹{selectedProduct.price}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        handleAddToCart(selectedProduct);
                        setSelectedProduct(null);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-[#7B1113] hover:bg-[#9B1C1E] text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>{t("store.addToCart")}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
