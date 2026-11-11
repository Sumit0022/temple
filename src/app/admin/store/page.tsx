"use client";

import React, { useState, useEffect } from "react";
import {
  ShoppingBag,
  Plus,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Search,
} from "lucide-react";

export default function AdminStorePage() {
  const [activeTab, setActiveTab] = useState<"orders" | "products">("orders");
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Product modal
  const [modalOpen, setModalOpen] = useState(false);
  const [prodName, setProdName] = useState("");
  const [prodNameHi, setProdNameHi] = useState("");
  const [prodCatId, setProdCatId] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodSalePrice, setProdSalePrice] = useState("");
  const [prodSku, setProdSku] = useState("");
  const [prodStock, setProdStock] = useState("");
  const [prodShelf, setProdShelf] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [prodImage, setProdImage] = useState("");
  const [creatingProd, setCreatingProd] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordRes, prodRes] = await Promise.all([
        fetch("/api/orders"),
        fetch("/api/products"),
      ]);
      const ordData = await ordRes.json();
      const prodData = await prodRes.json();

      if (Array.isArray(ordData)) setOrders(ordData);
      if (prodData.products) setProducts(prodData.products);
      if (prodData.categories) {
        setCategories(prodData.categories);
        if (prodData.categories.length > 0) setProdCatId(prodData.categories[0].id);
      }
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, orderStatus: newStatus } : o))
        );
      }
    } catch (err) {
      alert("Failed to update order status");
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingProd(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: prodName,
          nameHi: prodNameHi || prodName,
          categoryId: prodCatId,
          price: prodPrice,
          salePrice: prodSalePrice || null,
          sku: prodSku,
          stockQuantity: prodStock,
          shelfLifeDays: prodShelf,
          description: prodDesc,
          images: [prodImage],
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Product added successfully!");
        setModalOpen(false);
        setProdName("");
        setProdSku("");
        setProdPrice("");
        fetchData();
      } else {
        alert(data.error || "Failed to add product");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setCreatingProd(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold text-[#E58A13] uppercase tracking-wider">
            E-Commerce Operations
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#7B1113]">
            Prasad Bhandar & Orders Fulfillment
          </h1>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-[#7B1113] hover:bg-[#9B1C1E] text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Store Product</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-2">
        <button
          onClick={() => setActiveTab("orders")}
          className={`px-5 py-2.5 font-serif font-bold text-xs border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === "orders"
              ? "border-[#7B1113] text-[#7B1113]"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Devotee Orders Pipeline ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("products")}
          className={`px-5 py-2.5 font-serif font-bold text-xs border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === "products"
              ? "border-[#7B1113] text-[#7B1113]"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Product Catalog & Stock ({products.length})</span>
        </button>
      </div>

      {/* TAB 1: ORDERS FULFILLMENT TABLE */}
      {activeTab === "orders" && (
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Order No</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Fulfillment</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Order Status</th>
                  <th className="py-3 px-4 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500">
                      No orders placed yet.
                    </td>
                  </tr>
                ) : (
                  orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-amber-50/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#7B1113]">
                        {ord.orderNumber}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {new Date(ord.createdAt).toLocaleDateString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{ord.customerName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{ord.customerPhone}</span>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs text-slate-700">
                        {ord.orderItems?.map((i: any) => `${i.productName} (x${i.quantity})`).join(", ")}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800 block">
                          {ord.deliveryType === "PICKUP" ? "Counter Pickup" : "Home Delivery"}
                        </span>
                        {ord.shippingCity && (
                          <span className="text-[10px] text-slate-500 block">
                            {ord.shippingCity} ({ord.shippingPincode})
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-serif font-bold text-slate-900">
                        ₹{ord.totalAmount.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                          {ord.orderStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <select
                          value={ord.orderStatus}
                          onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                          className="px-2 py-1 rounded border border-slate-300 text-xs font-semibold bg-white outline-none"
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="PROCESSING">PROCESSING</option>
                          <option value="READY_FOR_PICKUP">READY FOR PICKUP</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTS CATALOG TABLE */}
      {activeTab === "products" && (
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Current Stock</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {p.name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {p.category?.name}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">
                      {p.sku}
                    </td>
                    <td className="py-3.5 px-4 font-serif font-bold text-[#7B1113]">
                      ₹{p.salePrice || p.price}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`font-bold ${p.stockQuantity <= p.minStockThreshold ? "text-red-600" : "text-emerald-700"}`}>
                        {p.stockQuantity} units
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {p.isActive ? "Active" : "Archived"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 relative shadow-2xl border border-amber-300 max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-slate-100 text-slate-500"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="font-serif font-bold text-xl text-[#7B1113] border-b pb-3 mb-4">
              Add Consecrated Product to Store Catalog
            </h2>

            <form onSubmit={handleAddProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kesar Peda Box (500g)"
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#E58A13]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hindi Title</label>
                  <input
                    type="text"
                    placeholder="e.g. केसर पेड़ा"
                    value={prodNameHi}
                    onChange={(e) => setProdNameHi(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#E58A13]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={prodCatId}
                    onChange={(e) => setProdCatId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white focus:ring-2 focus:ring-[#E58A13]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">SKU Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PRASAD-PEDA-01"
                    value={prodSku}
                    onChange={(e) => setProdSku(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg uppercase outline-none focus:ring-2 focus:ring-[#E58A13]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">MRP Price (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 350"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#E58A13]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sale Price (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 320"
                    value={prodSalePrice}
                    onChange={(e) => setProdSalePrice(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#E58A13]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Stock Qty *</label>
                  <input
                    type="number"
                    required
                    value={prodStock}
                    onChange={(e) => setProdStock(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#E58A13]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product Description</label>
                <textarea
                  rows={2}
                  placeholder="Details, ingredients, satvik preparation..."
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#E58A13]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={prodImage}
                  onChange={(e) => setProdImage(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div className="pt-3 border-t">
                <button
                  type="submit"
                  disabled={creatingProd}
                  className="w-full py-3 bg-[#7B1113] hover:bg-[#9B1C1E] text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow"
                >
                  {creatingProd ? "Publishing Product..." : "Save & Add to Store"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
