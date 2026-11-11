"use client";

import React, { useState, useEffect } from "react";
import {
  ClipboardList,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  AlertTriangle,
  Boxes,
  Truck,
  CheckCircle2,
  X,
} from "lucide-react";

export default function AdminInventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Stock movement modal
  const [movementModalOpen, setMovementModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [movementType, setMovementType] = useState("IN_PURCHASE");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [recording, setRecording] = useState(false);

  // Add Item modal
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [itemCategory, setItemCategory] = useState("PRASAD_RAW_MATERIAL");
  const [itemSku, setItemSku] = useState("");
  const [itemUnit, setItemUnit] = useState("kg");
  const [itemStock, setItemStock] = useState("");
  const [itemMinAlert, setItemMinAlert] = useState("");
  const [itemSupplierId, setItemSupplierId] = useState("");
  const [creatingItem, setCreatingItem] = useState(false);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/inventory");
      const data = await res.json();
      if (data.items) {
        setItems(data.items);
        if (data.items.length > 0) setSelectedItemId(data.items[0].id);
      }
      if (data.suppliers) {
        setSuppliers(data.suppliers);
        if (data.suppliers.length > 0) setItemSupplierId(data.suppliers[0].id);
      }
      if (data.movements) setMovements(data.movements);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleRecordMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId || !quantity) {
      alert("Please select item and quantity.");
      return;
    }

    setRecording(true);
    try {
      const res = await fetch("/api/inventory/movement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inventoryItemId: selectedItemId,
          movementType,
          quantity,
          reason,
        }),
      });

      if (res.ok) {
        alert("Stock movement recorded successfully.");
        setMovementModalOpen(false);
        setQuantity("");
        setReason("");
        fetchInventory();
      } else {
        const d = await res.json();
        alert(d.error || "Failed to record movement");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setRecording(false);
    }
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName || !itemSku) {
      alert("Name and SKU are required.");
      return;
    }

    setCreatingItem(true);
    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: itemName,
          category: itemCategory,
          sku: itemSku,
          unit: itemUnit,
          currentStock: itemStock,
          minStockAlert: itemMinAlert,
          supplierId: itemSupplierId || null,
        }),
      });

      if (res.ok) {
        alert("Inventory item added successfully.");
        setItemModalOpen(false);
        setItemName("");
        setItemSku("");
        fetchInventory();
      } else {
        const d = await res.json();
        alert(d.error || "Failed to create inventory item");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setCreatingItem(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold text-[#E58A13] uppercase tracking-wider">
            Supply Chain & Bhandar Store
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#7B1113]">
            Centralized Inventory & Stock Movements
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMovementModalOpen(true)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow"
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>Record Stock Movement</span>
          </button>

          <button
            onClick={() => setItemModalOpen(true)}
            className="px-4 py-2 bg-[#7B1113] hover:bg-[#9B1C1E] text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Inventory Item</span>
          </button>
        </div>
      </div>

      {/* Inventory Items Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h2 className="font-serif font-bold text-sm text-slate-800">
            Current Stock in Sanctum & Bhandar Storage ({items.length} materials)
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Item Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4">Alert Level</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Supplier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((i) => {
                const isLow = i.currentStock <= i.minStockAlert;
                return (
                  <tr key={i.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {i.name}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {i.category}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {i.sku}
                    </td>
                    <td className="py-3 px-4 font-serif font-bold text-sm">
                      <span className={isLow ? "text-red-600 flex items-center space-x-1" : "text-emerald-700"}>
                        {isLow && <AlertTriangle className="w-3.5 h-3.5 text-red-600 inline" />}
                        <span>{i.currentStock} {i.unit}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      &lt; {i.minStockAlert} {i.unit}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {i.location || "Main Store"}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {i.supplier?.name || "Local Vendor"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Movements Ledger */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <h2 className="font-serif font-bold text-sm text-slate-800">
            Immutable Stock Movement Audit Trail (Recent Activity)
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Item</th>
                <th className="py-3 px-4">Movement Type</th>
                <th className="py-3 px-4">Quantity</th>
                <th className="py-3 px-4">Previous &rarr; New Stock</th>
                <th className="py-3 px-4">Reason / Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {movements.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 text-slate-500 font-mono">
                    {new Date(m.createdAt).toLocaleString("en-IN")}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {m.inventoryItem?.name || m.product?.name || "General Stock"}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      m.movementType.startsWith("IN")
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-900"
                    }`}>
                      {m.movementType}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold">
                    {m.quantity}
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-mono">
                    {m.previousStock} &rarr; <strong>{m.newStock}</strong>
                  </td>
                  <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                    {m.reason || m.referenceOrderNumber || "Standard adjustment"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Movement Modal */}
      {movementModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 relative shadow-2xl border border-amber-300">
            <button
              onClick={() => setMovementModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-slate-100 text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="font-serif font-bold text-lg text-[#7B1113] border-b pb-2 mb-4">
              Record Stock Movement
            </h2>

            <form onSubmit={handleRecordMovement} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Inventory Item *</label>
                <select
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white"
                >
                  {items.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name} (Current: {i.currentStock} {i.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Movement Type *</label>
                <select
                  value={movementType}
                  onChange={(e) => setMovementType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white"
                >
                  <option value="IN_PURCHASE">IN_PURCHASE (New Goods Received)</option>
                  <option value="OUT_PRASAD_SEVA">OUT_PRASAD_SEVA (Kitchen Usage)</option>
                  <option value="ADJUSTMENT">ADJUSTMENT (Audit Correction)</option>
                  <option value="DAMAGED_EXPIRED">DAMAGED_EXPIRED (Wastage Write-off)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Quantity *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 10"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Procured for Ekadashi Mahaprasad"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={recording}
                className="w-full py-3 bg-[#7B1113] text-white font-bold rounded-xl shadow uppercase tracking-wider"
              >
                {recording ? "Recording..." : "Save Stock Movement"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {itemModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 relative shadow-2xl border border-amber-300">
            <button
              onClick={() => setItemModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-slate-100 text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="font-serif font-bold text-lg text-[#7B1113] border-b pb-2 mb-4">
              Add New Inventory Material
            </h2>

            <form onSubmit={handleCreateItem} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Material Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pure Desi Cow Ghee (Tins)"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={itemCategory}
                    onChange={(e) => setItemCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white"
                  >
                    <option value="PRASAD_RAW_MATERIAL">PRASAD RAW MATERIAL</option>
                    <option value="PUJA_SAMAGRI">PUJA SAMAGRI</option>
                    <option value="STORE_MERCHANDISE">STORE MERCHANDISE</option>
                    <option value="GENERAL_SUPPLY">GENERAL SUPPLY</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">SKU *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. RAW-GHEE-01"
                    value={itemSku}
                    onChange={(e) => setItemSku(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg uppercase outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit</label>
                  <input
                    type="text"
                    value={itemUnit}
                    onChange={(e) => setItemUnit(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Initial Stock</label>
                  <input
                    type="number"
                    value={itemStock}
                    onChange={(e) => setItemStock(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Low Alert</label>
                  <input
                    type="number"
                    value={itemMinAlert}
                    onChange={(e) => setItemMinAlert(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={creatingItem}
                className="w-full py-3 bg-[#7B1113] text-white font-bold rounded-xl shadow uppercase tracking-wider"
              >
                {creatingItem ? "Saving..." : "Create Inventory Item"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
