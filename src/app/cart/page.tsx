"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import { useCart } from "@/lib/cart-context";
import { launchRazorpayModal, loadRazorpayScript } from "@/lib/razorpay-client";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Truck,
  Building,
} from "lucide-react";

export default function CartPage() {
  const { lang, t } = useLanguage();
  const {
    items,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    shippingCost,
    deliveryType,
    setDeliveryType,
    grandTotal,
  } = useCart();

  // Checkout Form
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingState, setShippingState] = useState("Uttar Pradesh");
  const [shippingPincode, setShippingPincode] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);

  useEffect(() => {
    loadRazorpayScript();
  }, []);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!items.length) {
      alert("Your cart is empty.");
      return;
    }
    if (!customerName || !customerPhone) {
      alert("Please provide customer name and phone number.");
      return;
    }
    if (deliveryType === "HOME_DELIVERY" && (!shippingAddress || !shippingPincode)) {
      alert("Please provide complete delivery address and pincode.");
      return;
    }

    setLoading(true);
    try {
      // 1. Create Order
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerPhone,
          customerEmail,
          deliveryType,
          shippingAddress: deliveryType === "HOME_DELIVERY" ? shippingAddress : null,
          shippingCity: deliveryType === "HOME_DELIVERY" ? shippingCity : null,
          shippingState: deliveryType === "HOME_DELIVERY" ? shippingState : null,
          shippingPincode: deliveryType === "HOME_DELIVERY" ? shippingPincode : null,
          items: items.map((i) => ({ productId: i.id, quantity: i.quantity })),
          notes,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to create order");
      }

      // 2. Launch Official Razorpay Modal
      await launchRazorpayModal({
        key: data.gatewayOrder.key,
        orderId: data.gatewayOrder.id,
        amount: data.gatewayOrder.amount,
        name: "Shri Ram Mandir & Mahadev Mandir",
        description: `Prasad & Devotional Order #${data.orderNumber}`,
        prefill: {
          name: customerName,
          email: customerEmail,
          contact: customerPhone,
        },
        onSuccess: async (response) => {
          setLoading(true);
          try {
            const verifyRes = await fetch("/api/orders/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: data.orderId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              setConfirmedOrder(verifyData.order);
              clearCart();
            } else {
              alert("Payment confirmation failed: " + (verifyData.error || "Invalid signature"));
            }
          } catch (err: any) {
            alert("Verification error: " + err.message);
          } finally {
            setLoading(false);
          }
        },
        onError: (err) => {
          alert(`Payment Failed: ${err?.description || "Transaction was not completed"}`);
          setLoading(false);
        },
        onDismiss: () => {
          setLoading(false);
        },
      });
    } catch (err: any) {
      alert(err.message || "Failed to complete checkout");
      setLoading(false);
    }
  };

  if (confirmedOrder) {
    return (
      <div className="py-16 bg-[#FDFBF7]">
        <div className="max-w-2xl mx-auto px-4 text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-md">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
              Order Confirmed & Payment Received
            </span>
            <h1 className="font-serif text-3xl font-extrabold text-[#7B1113] mt-1">
              ॥ जय श्री राम ॥ Thank You for Your Order!
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Your sacred order <strong className="text-slate-900">#{confirmedOrder.orderNumber}</strong> has been placed successfully.
              {confirmedOrder.deliveryType === "PICKUP"
                ? " You can collect it from the Temple Prasad Counter with your Order ID."
                : ` It will be safely packed and dispatched to your address.`}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-amber-200 p-6 text-left shadow-sm space-y-3 text-xs">
            <div className="flex justify-between pb-2 border-b border-slate-100">
              <span className="text-slate-500">Order Number:</span>
              <span className="font-mono font-bold text-slate-900">{confirmedOrder.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Recipient Name:</span>
              <span className="font-semibold text-slate-800">{confirmedOrder.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Fulfillment Method:</span>
              <span className="font-semibold text-[#7B1113]">
                {confirmedOrder.deliveryType === "PICKUP" ? "Temple Counter Pickup" : "Safe Home Delivery"}
              </span>
            </div>
            {confirmedOrder.deliveryType === "HOME_DELIVERY" && (
              <div className="flex justify-between">
                <span className="text-slate-500">Shipping Address:</span>
                <span className="text-slate-800 text-right max-w-xs">
                  {confirmedOrder.shippingAddress}, {confirmedOrder.shippingCity} ({confirmedOrder.shippingPincode})
                </span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-slate-100 font-bold text-sm text-[#7B1113]">
              <span>Total Amount Paid:</span>
              <span>₹{confirmedOrder.totalAmount.toLocaleString("en-IN")}/-</span>
            </div>
          </div>

          <div className="pt-2 flex justify-center space-x-4">
            <Link
              href="/store"
              className="px-6 py-3 bg-[#7B1113] text-white font-bold rounded-xl text-xs hover:bg-[#9B1C1E] transition-colors"
            >
              Continue Shopping
            </Link>
            <Link
              href="/devotee"
              className="px-6 py-3 bg-amber-100 text-[#7B1113] font-bold rounded-xl text-xs hover:bg-amber-200 transition-colors"
            >
              View Order in Profile
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-20 text-center bg-[#FDFBF7]">
        <div className="max-w-md mx-auto px-4 space-y-4">
          <ShoppingBag className="w-16 h-16 text-amber-300 mx-auto" />
          <h2 className="font-serif text-2xl font-bold text-[#7B1113]">
            {lang === "hi" ? "आपकी टोकरी रिक्त है" : "Your Prasad Cart is Empty"}
          </h2>
          <p className="text-xs text-slate-500">
            Explore our consecrated fresh bhog, puja samagri, and devotional books.
          </p>
          <Link
            href="/store"
            className="inline-block mt-2 px-6 py-3 bg-[#E58A13] text-slate-950 font-bold rounded-xl text-xs shadow hover:brightness-110"
          >
            Explore Temple Store &rarr;
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-[#FDFBF7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif text-3xl font-extrabold text-[#7B1113] mb-8 pb-3 border-b border-amber-200">
          {lang === "hi" ? "प्रसाद टोकरी एवं चेकआउट" : "Prasad Shopping Cart & Checkout"}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Cart Items */}
          <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-amber-200 p-6 space-y-4">
            <h2 className="font-serif font-bold text-base text-slate-900 border-b pb-2">
              Order Items ({items.length})
            </h2>

            <div className="divide-y divide-slate-100">
              {items.map((item) => (
                <div key={item.id} className="py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-xl border border-amber-200 shrink-0"
                    />
                    <div>
                      <h3 className="font-serif font-bold text-sm text-slate-900">
                        {lang === "hi" && item.nameHi ? item.nameHi : item.name}
                      </h3>
                      <p className="font-serif text-xs font-semibold text-[#7B1113] mt-0.5">
                        ₹{item.salePrice || item.price}
                      </p>
                    </div>
                  </div>

                  {/* Quantity Controller & Delete */}
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1.5 text-slate-600 hover:text-black"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-2.5 font-bold text-xs text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1.5 text-slate-600 hover:text-black"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Delivery Type Option */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <label className="block font-serif font-bold text-sm text-slate-900">
                Choose Fulfillment Mode:
              </label>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div
                  onClick={() => setDeliveryType("PICKUP")}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-start space-x-2.5 ${
                    deliveryType === "PICKUP"
                      ? "border-[#7B1113] bg-amber-50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <Building className="w-4 h-4 text-[#7B1113] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-900">Temple Counter Pickup</p>
                    <p className="text-[11px] text-slate-500">Collect directly at Temple (₹0 Free)</p>
                  </div>
                </div>

                <div
                  onClick={() => setDeliveryType("HOME_DELIVERY")}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-start space-x-2.5 ${
                    deliveryType === "HOME_DELIVERY"
                      ? "border-[#7B1113] bg-amber-50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <Truck className="w-4 h-4 text-[#7B1113] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-900">Safe Home Delivery</p>
                    <p className="text-[11px] text-slate-500">All India Courier (₹80 / Free &gt;₹1500)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Checkout Form & Totals */}
          <div className="lg:col-span-5 bg-white rounded-2xl shadow-sm border border-amber-200 p-6 space-y-6">
            <h2 className="font-serif font-bold text-base text-slate-900 border-b pb-2">
              Delivery Details & Payment
            </h2>

            <form onSubmit={handleCheckout} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Chandra"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#E58A13]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mobile Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#E58A13]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="For tracking info"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#E58A13]"
                  />
                </div>
              </div>

              {deliveryType === "HOME_DELIVERY" && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Street Address *</label>
                    <input
                      type="text"
                      required
                      placeholder="House No, Street, Landmark"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#E58A13]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">City</label>
                      <input
                        type="text"
                        placeholder="e.g. Lucknow / Varanasi"
                        value={shippingCity}
                        onChange={(e) => setShippingCity(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#E58A13]"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Pincode *</label>
                      <input
                        type="text"
                        required
                        placeholder="6-digit Pincode"
                        value={shippingPincode}
                        onChange={(e) => setShippingPincode(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#E58A13]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Order Financial Summary */}
              <div className="pt-4 border-t border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Items Subtotal:</span>
                  <span>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping & Packaging:</span>
                  <span>{shippingCost === 0 ? "FREE" : `₹${shippingCost}`}</span>
                </div>
                <div className="flex justify-between text-base font-serif font-bold text-[#7B1113] pt-2 border-t border-slate-200">
                  <span>Grand Total:</span>
                  <span>₹{grandTotal.toLocaleString("en-IN")}/-</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-[#7B1113] to-[#9B1C1E] text-white font-bold rounded-xl shadow-md hover:brightness-110 active:scale-98 transition-all text-xs tracking-wider uppercase flex items-center justify-center space-x-1.5"
              >
                <span>
                  {loading
                    ? "Confirming Prasad Order..."
                    : `Place Order & Pay ₹${grandTotal.toLocaleString("en-IN")}`}
                </span>
                <ArrowRight className="w-4 h-4 text-amber-300" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
