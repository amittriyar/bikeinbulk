'use client';
import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import * as XLSX from 'xlsx';
import { exportToExcel } from '@/lib/exportUtils'
import TopNav from '@/components/ui/TopNav';
export const runtime = 'nodejs';

/* ================= MOCK DATA ================= */

const KPI = [
  { label: 'Active Products', value: 24 },
  { label: 'Open RFQs', value: 6 },
  { label: 'Live Orders', value: 3 },
  { label: 'Issued Vouchers', value: 1280 },
];

const ORDERS = [
  {
    id: 'ORD-2026-101',
    buyer: 'ABC Corp',
    value: '₹1.2 Cr',
    paymentStatus: 'Verified',
    voucherStatus: 'Pending',
  },
  {
    id: 'ORD-2026-102',
    buyer: 'XYZ Ltd',
    value: '₹85 L',
    paymentStatus: 'Pending',
    voucherStatus: '—',
  },
];
const REDEMPTIONS = [
  { id: 'R-001', dealer: 'TVS Chennai', amount: '₹2,000', date: 'Jan 2026' },
  { id: 'R-002', dealer: 'TVS Pune', amount: '₹3,500', date: 'Feb 2026' },
];
const VOUCHERS = [
  {
    code: 'VCH-001',
    orderId: 'ORD-2026-101',
    beneficiary: 'Rahul Sharma',
    value: '₹2,000',
    status: 'Redeemed',
    validTill: '31-12-2026',
  },
];

/* ================= PAGE ================= */

export default function SellersDashboard() {


  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [vouchers, setVouchers] = useState<any[]>([]);
  useEffect(() => {
    fetch(`/api/voucher/list?sellerId=SELLER_001`)
      .then(res => res.json())
      .then(data => setVouchers(data));
  }, []);
  const [redemptions, setRedemptions] = useState<any[]>([])
  useEffect(() => {
    fetch('/api/redemptions')
      .then(res => res.json())
      .then(setRedemptions)
  }, [])
  type ModalType =
    | null
    | 'respondRFQ'
    | 'viewOrder'
    | 'issueVoucher'
    | 'viewRFQ';
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const downloadCatalogue = () => {
    const rows = catalogue.map(p =>
      `${p.name},${p.category},${p.voucher},${p.moq},${p.status}`
    );
    const csv = "Product,Category,Voucher,MOQ,Status\n" + rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "catalogue.csv";
    a.click();
  };
  const downloadOrderPDF = async (o: any) => {
    try {
      const res = await fetch(`/api/documents/po/pdf?orderId=${o.orderId}`);
      if (!res.ok) {
        alert("PO not available yet");
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `PO-${o.orderId}.pdf`;
      a.click();
    } catch (err) {
      console.error("PO download error:", err);
      alert("Error downloading PO");
    }
  };
  const [selectedRfq, setSelectedRfq] = useState<any | null>(null);
  const downloadAllRFQs = () => {
    const rows = sellerRFQs.map(r =>
      `${r.rfqId},${r.buyerName},${r.rfqType},${r.status}`
    );
    const csv = "RFQ ID,Buyer,Type,Status\n" + rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "all_rfqs.csv";
    a.click();
  };
  const downloadRFQExcel = (r: any) => {
    const rows = (r.items || []).map((i: any) => {
      const locations = (i.locations || [])
        .map((l: any) => `${l.city}:${l.qty}`)
        .join(" | ");

      return `${r.rfqId},${r.rfqType},${i.modelName || ''},${locations}`;
    });
    const csv =
      "RFQ ID,Type,Model,Locations\n" +
      rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${r.rfqId}.csv`;
    a.click();
  };
  function viewQuotation(r: any) {
    window.open(`/api/documents/quotations/pdf?rfqId=${r.rfqId}`, "_blank");
  }
  async function downloadQuotation(rfq: any) {
    const res = await fetch(`/api/documents/quotations/pdf?rfqId=${rfq.rfqId}`)
    const blob = await res.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `Quotation-${rfq.rfqId}.pdf`
    a.click()
  }
  const generateProforma = async (orderId: string) => {
    try {
      const res = await fetch(`/api/documents/proforma/pdf?orderId=${orderId}`);
      if (!res.ok) {
        alert("Failed to generate proforma");
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Proforma-${orderId}.pdf`;
      a.click();
      // 🔥 OPTIONAL: mark as generated (recommended)
      await fetch("/api/order/proformaGenerated", {
        method: "POST",
        body: JSON.stringify({ orderId })
      });
    } catch (err) {
      console.error(err);
      alert("Error generating proforma");
    }
  };

  const [sellerVouchers, setSellerVouchers] = useState([]);

  useEffect(() => {
    fetch(`/api/voucher/list?sellerId=SELLER_001`)
      .then(res => res.json())
      .then(setSellerVouchers);
  }, []);

  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const USER_ROLE = 'seller';
  const [tab, setTab] = useState<
    'catalogue' | 'rfqs' | 'orders' | 'beneficiaries' | 'redemptions' | 'resellers'
  >('catalogue');

  /* ---------- STATES ---------- */
  const [kpiData, setKpiData] = useState({
    activeProducts: 0,
    openRfqs: 0,
    liveOrders: 0,
    issuedVouchers: 0,
  });
  const [catalogue, setCatalogue] = useState<any[]>([]);
  const [image, setImage] = useState<any>(null);
  const [loadingCatalogue, setLoadingCatalogue] = useState(true);
  const [uploadedProducts, setUploadedProducts] = useState<any[]>([]);
  const [previewErrors, setPreviewErrors] = useState<any[]>([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState<any>({
    modelName: '',
    category: '',
    subCategory: '',
    engine: '',
    price: '',
    moq: '',
  });
  const [filters, setFilters] = useState<any>({
    name: '',
    category: '',
    subCategory: '',
    engine: '',
    minPrice: '',
    maxPrice: '',
    minMOQ: '',
    status: '',
  });
  const [catalogueTick, setCatalogueTick] = useState(0);
  const [sellerRFQs, setSellerRFQs] = useState<any[]>([]);
  const [resellers, setResellers] = useState<any[]>([]);
  const [pendingResellers, setPendingResellers] = useState<any[]>([]);
  const [sellerOrders, setSellerOrders] = useState<any[]>([]);
  const [orderBeneficiaries, setOrderBeneficiaries] = useState<any[]>([]);
  useEffect(() => {
    if (tab === 'beneficiaries') {
      fetch('/api/seller/order/beneficiaries?sellerId=SELLER_001')
        .then(res => res.json())
        .then(setOrderBeneficiaries);
    }
  }, [tab]);

  const [selectedVoucher, setSelectedVoucher] = useState<any>(null);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [discontinuingId, setDiscontinuingId] = useState<string | null>(null);
  const productFileRef = useRef<HTMLInputElement>(null);
  const resellerFileRef = useRef<HTMLInputElement>(null);
  const [bidForm, setBidForm] = useState({
    quotedUnitPrice: '',
    moq: '',
    deliveryTimeline: '',
    validityDays: '',
    remarks: '',
  });
  const submitBid = async () => {
    if (!selectedRfq) return;
    await fetch('/api/seller/bid', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rfqId: selectedRfq.rfqId,
        sellerId: 'SELLER_001',
        sellerName: 'Seller OEM',
        locationQuotes: selectedRfq.items.map((item: any) => ({
          modelName: item.modelName,
          locations: item.locations.map((loc: any) => ({
            city: loc.city,
            qty: loc.qty,
            quotedPrice: loc.quotedPrice
          }))
        })),
        moq: Number(bidForm.moq),
        deliveryTimeline: bidForm.deliveryTimeline,
        validityDays: Number(bidForm.validityDays),
        remarks: bidForm.remarks,
      }),
    });
    setActiveModal(null);
    setSelectedRfq(null);
    setBidForm({
      quotedUnitPrice: '',
      moq: '',
      deliveryTimeline: '',
      validityDays: '',
      remarks: '',
    });
  };
  /* ---------- HELPERS ---------- */
  const fetchCatalogue = async () => {
    const res = await fetch('/api/seller/catalogue/list');
    if (!res.ok) {
      const text = await res.text();
      console.error('Catalogue API error:', res.status, text);
      return;
    }
    const data = await res.json();
    setCatalogue(data);
    setLoadingCatalogue(false);
  };
  const updateFilter = (key: string, value: string) => {
    setFilters((prev: any) => ({ ...prev, [key]: value }));
  };
  const handlePublishCatalogue = async () => {
    await fetch('/api/seller/catalogue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        oemName: 'Seller OEM',
        modelName: form.modelName,
        category: form.category,
        fuelType: form.category.includes('EV') ? 'EV' : 'ICE',
        engineCapacity: form.engine,
        exShowroomPrice: Number(form.price),
        moq: Number(form.moq),
        // 🔥 THIS WAS MISSING
        status: 'PUBLISHED',
      }),
    });
    await fetchCatalogue();
    setForm({
      modelName: '',
      category: '',
      subCategory: '',
      engine: '',
      price: '',
      moq: '',
    });
  };
  const handleDiscontinue = async (id: string) => {
    await fetch('/api/seller/catalogue/discontinue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    await fetchCatalogue();
  };
  const handleProductExcel = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      const validRows: any[] = [];
      const errors: any[] = [];
      rows.forEach((r, index) => {
        const rowNumber = index + 2; // Excel row number
        const product = {
          oemName: String(r.OEMName || '').trim(),
          modelName: String(r.ModelName || '').trim(),
          category: String(r.Category || '').trim(),
          fuelType: String(r.FuelType || '').trim(),
          engineCapacity: String(r.EngineCapacity || '').trim(),
          exShowroomPrice: Number(r.ExShowroomPrice),
          moq: Number(r.MOQ),
        };
        if (!product.modelName || !product.oemName) {
          errors.push({ row: rowNumber, message: "OEM Name and Model Name required" });
          return;
        }
        if (isNaN(product.exShowroomPrice) || product.exShowroomPrice <= 0) {
          errors.push({ row: rowNumber, message: "Invalid price" });
          return;
        }
        if (isNaN(product.moq) || product.moq <= 0) {
          errors.push({ row: rowNumber, message: "Invalid MOQ" });
          return;
        }
        validRows.push(product);
      });
      setUploadedProducts(validRows);
      setPreviewErrors(errors);
      setShowPreviewModal(true);
    };
    reader.readAsArrayBuffer(file);
  };
  const handleResellerExcel = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async e => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      for (const r of rows) {
        const payload = {
          resellerCode: String(r.ResellerCode || '').trim(),
          oemName: 'TVS Motor Company Ltd.', // or dynamic seller
          companyName: r.Company || '',
          contactName: r.ContactName || '',
          mobile: String(r.Mobile || ''),
          email: r.Email || '',
          city: r.City || '',
          state: r.State || '',
          pincode: String(r.PinCode || ''),
          status: r.Status === 'Inactive' ? 'Inactive' : 'Active',
        };
        if (!payload.resellerCode) continue;
        await fetch('/api/seller/resellers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      // reload from API (persistent)
      const updated = await fetch('/api/seller/resellers').then(r => r.json());
      setResellers(updated);
    };
    reader.readAsArrayBuffer(file);
  };
  /* ---------- FILTERED DATA ---------- */
  const filteredPublishedProducts = useMemo(() => {
    return catalogue
      .filter(p => p.status === 'PUBLISHED')
      .filter(p =>
        (!filters.name ||
          (p.modelName || p.model || '')
            .toLowerCase()
            .includes(filters.name.toLowerCase())
        ) &&
        (!filters.category || p.category === filters.category) &&
        (!filters.engine ||
          p.engineCapacity?.toLowerCase().includes(filters.engine.toLowerCase())) &&
        (!filters.minPrice ||
          Number(p.exShowroomPrice) >= Number(filters.minPrice)) &&
        (!filters.maxPrice ||
          Number(p.exShowroomPrice) <= Number(filters.maxPrice)) &&
        (!filters.minMOQ || Number(p.moq) >= Number(filters.minMOQ))
      );
  }, [catalogue, filters]);
  useEffect(() => {
    fetchCatalogue();
  }, []);
  useEffect(() => {
    fetch('/api/seller/rfq/list')
      .then(r => r.json())
      .then(setSellerRFQs);
  }, []);
  useEffect(() => {
    fetch('/api/seller/order/list?sellerId=SELLER_001')
      .then(res => res.json())
      .then(setSellerOrders);
  }, []);
  useEffect(() => {
    const loadResellers = async () => {
      try {
        const res = await fetch('/api/seller/resellers');
        if (!res.ok) {
          console.error('Failed to fetch resellers');
          setResellers([]);
          return;
        }
        const data = await res.json();
        setResellers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Reseller fetch error:', err);
        setResellers([]);
      }
    };
    loadResellers();
  }, []);
  useEffect(() => {
    const loadPending = async () => {
      const res = await fetch('/api/reseller/pending')
      const data = await res.json()
      setPendingResellers(data)
    }
    loadPending()
  }, [])
  const handleApproval = async (userId: string, action: string) => {
    await fetch('/api/reseller/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action })
    })
    // reload pending list
    const res = await fetch('/api/reseller/pending')
    const data = await res.json()
    setPendingResellers(data)
  }
  useEffect(() => {
    const fetchKpis = async () => {
      const sellerId = "SELLER_001";
      const [catalogueRes, rfqRes, orderRes, voucherRes] = await Promise.all([
        fetch("/api/seller/catalogue/list"),
        fetch("/api/seller/rfq/list"),
        fetch(`/api/seller/order/list?sellerId=${sellerId}`),
        fetch("/api/voucher/list"),
      ]);
      const catalogue = await catalogueRes.json();
      const rfqs = await rfqRes.json();
      const orders = await orderRes.json();
      const vouchers = await voucherRes.json();
      setKpiData({
        activeProducts: catalogue.filter((c: any) => c.status === "PUBLISHED").length,
        openRfqs: rfqs.filter((r: any) => r.status === "OPEN").length,
        liveOrders: orders.filter((o: any) => o.status !== "CLOSED").length,
        issuedVouchers: vouchers.filter((v: any) => v.sellerId === sellerId).length,
      });
    };
    fetchKpis();
  }, []);
  const addReseller = async () => {
    const payload = {
      resellerCode: (document.getElementById('r_code') as HTMLInputElement).value,
      oemName: 'TVS Motor Company Ltd.', // or dynamic seller name
      companyName: (document.getElementById('r_company') as HTMLInputElement).value,
      contactName: (document.getElementById('r_name') as HTMLInputElement).value,
      mobile: (document.getElementById('r_mobile') as HTMLInputElement).value,
      email: (document.getElementById('r_email') as HTMLInputElement).value,
      city: (document.getElementById('r_city') as HTMLInputElement).value,
      state: (document.getElementById('r_state') as HTMLInputElement).value,
      pincode: (document.getElementById('r_pincode') as HTMLInputElement).value,
      status: (document.getElementById('r_status') as HTMLSelectElement).value,
    };
    const res = await fetch('/api/seller/resellers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      alert('Duplicate or invalid Reseller Code');
      return;
    }
    // Reload reseller list from API
    const updated = await fetch('/api/seller/resellers').then(r => r.json());
    setResellers(updated);
  };
  async function sendQuotation(rfq: any) {
    try {
      await fetch("/api/seller/sendQuotation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rfqId: rfq.rfqId
        })
      });
      alert("Quotation sent to buyer");
    } catch (err) {
      alert("Failed to send quotation");
    }
  }
  let grouped: Record<string, any[]> = {};
  if (orderBeneficiaries && orderBeneficiaries.length > 0) {
    orderBeneficiaries.forEach((b: any) => {
      const city = b.beneficiary?.city || "UNKNOWN";
      if (!grouped[city]) grouped[city] = [];
      grouped[city].push(b);
    });
  }
  let allocationSummary: any[] = [];
  if (selectedOrder?.items) {
    selectedOrder.items.forEach((model: any) => {
      model.locations?.forEach((loc: any) => {
        const city = loc.city;
        const assigned = grouped[city]?.length || 0;
        allocationSummary.push({
          model: model.model || model.modelName,
          city,
          assigned,
          required: loc.qty
        });
      });
    });
  }
  const vouchersByOrder = Object.values(
    sellerVouchers.reduce((acc: any, v: any) => {
      if (!acc[v.orderId]) acc[v.orderId] = [];
      acc[v.orderId].push(v);
      return acc;
    }, {})
  );

  /* ================= RENDER ================= */
  return (
    <>
      <TopNav />
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="mb-8">
          <div className="bg-gray-50 border rounded-2xl p-6 shadow-sm relative overflow-hidden">

            {/* subtle soft overlay (keeps premium feel) */}
            <div className="absolute inset-0 bg-white/40 backdrop-blur-sm"></div>

            <div className="relative z-10">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-800">
                Sellers Dashboard
              </h1>

              <p className="text-sm mt-2 text-gray-500">
                Manage catalogue, RFQs, resellers and voucher issuance
              </p>
            </div>

          </div>
        </div>
        {/* KPI */}
        <div className="grid grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Active Products', value: kpiData.activeProducts, color: 'bg-blue-50' },
            { label: 'Open RFQs', value: kpiData.openRfqs, color: 'bg-yellow-50' },
            { label: 'Live Orders', value: kpiData.liveOrders, color: 'bg-green-50' },
            { label: 'Issued Vouchers', value: kpiData.issuedVouchers, color: 'bg-purple-50' },
          ].map((k, i) => (
            <div key={i} className={`${k.color} rounded-2xl p-5 shadow-sm border`}>
              <p className="text-sm text-gray-600">{k.label}</p>
              <p className="text-2xl font-bold mt-1">{k.value}</p>
            </div>
          ))}
        </div>

        {/* 🔥 VIEW RFQ MODAL */}
        {activeModal === 'viewRFQ' && selectedRfq && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white w-[700px] max-h-[80vh] overflow-auto p-6 rounded-xl shadow-xl">
              <h2 className="text-xl font-bold mb-4">RFQ Details</h2>
              <p><b>RFQ ID:</b> {selectedRfq.rfqId}</p>
              <p><b>Type:</b> {selectedRfq.rfqType}</p>
              <p><b>Status:</b> {selectedRfq.status}</p>
              <hr className="my-3" />
              <h3 className="font-semibold mb-2">Items</h3>
              {(selectedRfq.items || []).map((i: any, idx: number) => (
                <div key={idx} className="border p-3 rounded mb-2">
                  <p><b>Model:</b> {i.modelName || '-'}</p>
                  <p><b>Fuel:</b> {i.fuelType || '-'}</p>
                  <p><b>Vehicle:</b> {i.vehicleType || '-'}</p>
                  <p className="mt-1"><b>Locations:</b></p>
                  <ul className="text-sm ml-4 list-disc">
                    {(i.locations || []).map((l: any, j: number) => (
                      <li key={j}>
                        {l.city} – Qty: {l.qty}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div className="flex justify-end mt-4">
                <button
                  className="px-4 py-2 bg-gray-600 text-white rounded"
                  onClick={() => setActiveModal(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 🔥 RFQ RESPONSE MODAL */}
        {activeModal === 'respondRFQ' && selectedRfq && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-4xl rounded-xl shadow-lg p-6 overflow-y-auto max-h-[90vh]">
              {/* ===== HEADER ===== */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">
                  Respond to RFQ – {selectedRfq.rfqId}
                </h2>
                <button
                  className="text-gray-500 hover:text-gray-700 text-xl"
                  onClick={() => {
                    setActiveModal(null);
                    setSelectedRfq(null);
                  }}
                >
                  ✕
                </button>
              </div>
              {/* ===== RFQ META ===== */}
              <div className="bg-gray-50 p-4 rounded mb-6 text-sm">
                <p><strong>Buyer:</strong> {selectedRfq.buyerName || selectedRfq.buyerId}</p>
                <p><strong>RFQ Type:</strong> {selectedRfq.rfqType}</p>
                <p><strong>Status:</strong> {selectedRfq.status}</p>
              </div>
              {/* ===== ITEMS TABLE ===== */}
              <h3 className="font-medium mb-3">Requested Models</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-sm font-medium">MOQ</label>
                  <input
                    type="number"
                    className="border p-2 w-full"
                    placeholder="Minimum order quantity"
                    value={bidForm.moq}
                    onChange={e =>
                      setBidForm({ ...bidForm, moq: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Delivery Timeline</label>
                  <input
                    className="border p-2 w-full"
                    placeholder="e.g. 15 days"
                    value={bidForm.deliveryTimeline}
                    onChange={e =>
                      setBidForm({ ...bidForm, deliveryTimeline: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Quote Validity (days)</label>
                  <input
                    type="number"
                    className="border p-2 w-full"
                    placeholder="e.g. 30"
                    value={bidForm.validityDays}
                    onChange={e =>
                      setBidForm({ ...bidForm, validityDays: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Quoted Unit Price (₹)</label>
                  <input
                    type="number"
                    className="border p-2 w-full"
                    placeholder="e.g. 86000"
                    value={bidForm.quotedUnitPrice}
                    onChange={e =>
                      setBidForm({ ...bidForm, quotedUnitPrice: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Remarks</label>
                  <input
                    className="border p-2 w-full"
                    placeholder="Optional"
                    value={bidForm.remarks}
                    onChange={e =>
                      setBidForm({ ...bidForm, remarks: e.target.value })
                    }
                  />
                </div>
              </div>
              <table className="w-full text-sm border mb-6">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 text-left">Model</th>
                    <th className="p-2 text-left">City</th>
                    <th className="p-2 text-center">Qty</th>
                    <th className="p-2 text-left">Quoted Unit Price (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedRfq.items.map((item: any, itemIdx: number) =>
                    (item.locations || []).map((loc: any, locIdx: number) => (
                      <tr key={`${itemIdx}-${locIdx}`} className="border-t">
                        {/* Model */}
                        <td className="p-2">
                          {item.modelName || `${item.fuelType} ${item.vehicleType}`}
                        </td>
                        {/* City */}
                        <td className="p-2">
                          {loc.city}
                        </td>
                        {/* Quantity */}
                        <td className="p-2 text-center">
                          {loc.qty}
                        </td>
                        {/* Quoted Price */}
                        <td className="p-2">
                          <input
                            type="number"
                            className="border p-1 w-full"
                            placeholder="Enter price"
                            value={loc.quotedPrice || ''}
                            onChange={(e) => {
                              const value = Number(e.target.value);
                              setSelectedRfq((prev: any) => {
                                const updated = { ...prev };
                                updated.items[itemIdx].locations[locIdx].quotedPrice = value;
                                return updated;
                              });
                            }}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              {/* ===== ACTIONS ===== */}
              <div className="flex justify-end gap-4">
                <button
                  className="px-4 py-2 border rounded"
                  onClick={() => {
                    setActiveModal(null);
                    setSelectedRfq(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-indigo-600 text-white rounded"
                  onClick={submitBid}
                >
                  Submit Bid
                </button>
              </div>
            </div>
          </div>
        )}
        {/* 🔥 VIEW ORDER MODAL */}
        {activeModal === 'viewOrder' && selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white w-[750px] max-h-[90vh] overflow-auto p-6 rounded-xl shadow-xl">

              {/* HEADER */}
              <div className="flex justify-between items-center mb-4">

                <h2 className="text-xl font-bold">
                  Order Control Center
                </h2>

                <button
                  className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                  onClick={() => setActiveModal(null)}
                >
                  ✕
                </button>

              </div>
              {/* ================= ORDER INFO ================= */}
              <div className="grid md:grid-cols-2 gap-4 text-sm mb-4">
                <p><b>Order ID:</b> {selectedOrder.orderId}</p>
                <p><b>Buyer:</b> {selectedOrder.buyerName || selectedOrder.buyerId}</p>
                <p><b>Status:</b> {selectedOrder.status}</p>
                <p><b>RFQ ID:</b> {selectedOrder.rfqId}</p>
              </div>
              {/* ================= INTELLIGENCE GRID ================= */}
              <div className="grid md:grid-cols-3 gap-4 mb-6 items-stretch">

                {/* ================= BENEFICIARY ================= */}
                {(() => {
                  const beneficiaries = orderBeneficiaries.filter(
                    (b: any) => b.orderId === selectedOrder.orderId
                  );

                  return (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">📊 Beneficiary</h3>

                      <div className="text-sm space-y-1">
                        <p><b>Total:</b> {beneficiaries.length}</p>
                        <p>
                          <b>Assigned:</b>{" "}
                          {beneficiaries.filter(b => b.voucherStatus === "ISSUED").length}
                        </p>
                        <p>
                          <b>Pending:</b>{" "}
                          {beneficiaries.filter(b => b.voucherStatus !== "ISSUED").length}
                        </p>
                      </div>
                    </div>
                  );
                })()}

                {/* ================= VOUCHERS ================= */}
                {(() => {
                  const orderVouchers = vouchers.filter(
                    (v: any) => v.orderId === selectedOrder.orderId
                  );

                  const redeemed = orderVouchers.filter(
                    (v: any) =>
                      v.status === "REDEEMED" || v.status === "Redeemed"
                  ).length;

                  const total = orderVouchers.length;

                  return (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">🎟 Vouchers</h3>

                      <div className="text-sm space-y-1">
                        <p><b>Total:</b> {total}</p>
                        <p><b>Redeemed:</b> {redeemed}</p>
                        <p><b>Active:</b> {total - redeemed}</p>
                        <p>
                          <b>Redemption %:</b>{" "}
                          {total > 0 ? Math.round((redeemed / total) * 100) : 0}%
                        </p>
                      </div>
                    </div>
                  );
                })()}

                {/* ================= FINANCIAL ================= */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">💰 Financial</h3>

                  <div className="text-sm space-y-1">
                    <p><b>Order Value:</b> ₹{selectedOrder.orderValue || 0}</p>
                    <p><b>Paid:</b> ₹{selectedOrder.amountPaid || 0}</p>
                    <p>
                      <b>Status:</b>{" "}
                      {selectedOrder.paymentStatus || "Pending"}
                    </p>
                  </div>
                </div>

              </div>
              {/* ================= ITEMS (UNCHANGED) ================= */}
              <h3 className="font-semibold mb-2">Items</h3>

              {(selectedOrder.items || []).map((i: any, idx: number) => (
                <div key={idx} className="border p-3 rounded mb-3">
                  <p><b>Model:</b> {i.modelName}</p>
                  <p><b>Total Qty:</b> {i.requestedQty}</p>
                  <p><b>Unit Price:</b> ₹{i.unitPrice}</p>

                  <div className="mt-2">
                    <p className="font-medium text-sm">City-wise Distribution:</p>
                    <ul className="ml-4 list-disc text-sm text-gray-600">
                      {(i.locations || []).map((l: any, j: number) => (
                        <li key={j}>
                          {l.city} – {l.qty}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}

              {/* ================= ACTIONS (ENHANCED) ================= */}
              <div className="flex flex-wrap justify-between gap-3 mt-6">

                <div className="flex gap-2">

                  <button
                    className="px-4 py-2 bg-indigo-600 text-white rounded"
                    onClick={() => downloadOrderPDF(selectedOrder)}
                  >
                    Download PO
                  </button>

                  <button
                    className="px-4 py-2 bg-gray-800 text-white rounded"
                    onClick={() => {
                      setTab("beneficiaries");
                      setActiveModal(null);
                    }}
                  >
                    Manage Beneficiaries
                  </button>

                </div>

                <div className="flex gap-2">

                  <button
                    className="px-4 py-2 bg-yellow-600 text-white rounded"
                    onClick={() => alert("Trigger reminder flow")}
                  >
                    Send Reminder
                  </button>

                  <button
                    className="px-4 py-2 bg-green-600 text-white rounded"
                    onClick={async () => {
                      const res = await fetch(
                        `/api/documents/voucher/bundle?orderId=${selectedOrder.orderId}`
                      );

                      const blob = await res.blob();
                      const url = window.URL.createObjectURL(blob);

                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `Vouchers-${selectedOrder.orderId}.zip`;
                      a.click();

                      window.URL.revokeObjectURL(url);
                    }}
                  >
                    Download Vouchers
                  </button>


                </div>
              </div>

            </div>
          </div>
        )}

        {/* TABS */}
        <div className="bg-white p-1 rounded-xl shadow-sm inline-flex gap-2 mb-6">
          {(['catalogue', 'rfqs', 'orders', 'beneficiaries', 'redemptions', 'resellers'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`
              px-4 py-2 rounded-lg text-sm font-medium transition
                 ${tab === t
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-gray-600 hover:bg-gray-100'
                }
                `}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>


        {/* ================= CATALOGUE ================= */}
        {tab === 'catalogue' && (
          <div className="grid md:grid-cols-3 gap-6">

            {/* ================= LEFT PANEL ================= */}
            <div className="bg-gray-50 p-5 rounded-2xl border shadow-sm">
              <h3 className="font-semibold mb-4 text-lg">Add Catalogue Item</h3>

              <div className="grid grid-cols-1 gap-3">

                <input
                  className="border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Model Name"
                  value={form.modelName}
                  onChange={e =>
                    setForm({ ...form, modelName: e.target.value })
                  }
                />

                <select
                  className="border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={form.category}
                  onChange={e =>
                    setForm({ ...form, category: e.target.value })
                  }
                >
                  <option value="">Select Category</option>
                  <option value="2W EV">2W EV</option>
                  <option value="2W ICE">2W ICE</option>
                </select>

                <input
                  className="border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Engine"
                  value={form.engine}
                  onChange={e =>
                    setForm({ ...form, engine: e.target.value })
                  }
                />

                <input
                  className="border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Price"
                  value={form.price}
                  onChange={e =>
                    setForm({ ...form, price: e.target.value })
                  }
                />

                <input
                  className="border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="MOQ"
                  value={form.moq}
                  onChange={e =>
                    setForm({ ...form, moq: e.target.value })
                  }
                />

                <input
                  className="border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Specifications (Battery, Range, Engine etc.)"
                />

                <input
                  type="file"
                  onChange={(e) => setImage(e.target.files?.[0])}
                  className="border rounded-lg p-2"
                />

                <button
                  className="mt-3 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg shadow-sm transition"
                  onClick={handlePublishCatalogue}
                >
                  Publish Catalogue
                </button>

              </div>
            </div>


            {/* ================= RIGHT PANEL ================= */}
            <div className="md:col-span-2 space-y-6">

              {/* ===== BULK UPLOAD ===== */}
              <div className="bg-white p-5 rounded-2xl border shadow-sm">
                <h3 className="font-semibold mb-3">Bulk Upload Catalogue</h3>

                <div className="border-2 border-dashed rounded-xl p-6 text-center hover:bg-gray-50 transition">
                  <p className="text-sm text-gray-500 mb-2">
                    Upload Excel (.xlsx / .xls)
                  </p>

                  <input
                    ref={productFileRef}
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={e =>
                      e.target.files && handleProductExcel(e.target.files[0])
                    }
                    className="text-sm"
                  />
                </div>
              </div>


              {/* ===== TABLE ===== */}
              <div className="bg-white p-5 rounded-2xl border shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-lg">Published Catalogue</h3>

                  <button
                    onClick={() => exportToExcel(filteredPublishedProducts, "published_catalogue")}
                    className="text-sm bg-indigo-600 text-white px-3 py-1 rounded"
                  >
                    Download Published Catalogue
                  </button>
                </div>

                <table className="w-full text-sm border-separate border-spacing-y-2">
                  <thead>
                    <tr className="text-gray-500 text-xs">
                      <th className="text-left p-2">Catalogue ID</th>
                      <th className="text-left p-2">Model</th>
                      <th className="p-2">Category</th>
                      <th className="p-2">Engine</th>
                      <th className="p-2">Price</th>
                      <th className="p-2">MOQ</th>
                      <th className="p-2">Status</th>
                      <th className="p-2">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredPublishedProducts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-gray-400">
                          No catalogue items published yet
                        </td>
                      </tr>
                    ) : (
                      filteredPublishedProducts.map((p, i) => (
                        <tr
                          key={p.id || i}
                          className="bg-gray-50 hover:bg-gray-100 transition rounded-lg shadow-sm"
                        >
                          <td className="p-2 font-medium">
                            <span className="text-indigo-600 hover:underline cursor-pointer">
                              {p.id || `CAT-${i + 1}`}
                            </span>
                          </td>

                          <td className="p-2 font-medium">
                            {p.model || p.modelName}
                          </td>

                          <td className="p-2">{p.category}</td>

                          <td className="p-2">
                            {p.engineCapacity || '—'}
                          </td>

                          <td className="p-2 font-semibold">
                            ₹{p.exShowroomPrice}
                          </td>

                          <td className="p-2">{p.moq}</td>

                          <td className="p-2">
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                              Published
                            </span>
                          </td>

                          <td className="p-2">
                            <button
                              onClick={() => handleDiscontinue(p.id)}
                              disabled={discontinuingId === p.id}
                              className={`px-3 py-1 rounded text-xs transition
                        ${discontinuingId === p.id
                                  ? 'bg-gray-200 text-gray-500'
                                  : 'bg-red-100 text-red-700 hover:bg-red-200'
                                }`}
                            >
                              {discontinuingId === p.id
                                ? 'Discontinuing…'
                                : 'Discontinue'}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          </div>
        )}

        {showPreviewModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-6xl rounded-xl p-6 max-h-[90vh] overflow-y-auto">

              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Catalogue Upload Preview</h2>
                <button onClick={() => setShowPreviewModal(false)}>✕</button>
              </div>

              {previewErrors.length > 0 && (
                <div className="bg-red-50 p-4 rounded mb-4">
                  <h3 className="font-medium text-red-600">Errors Found</h3>
                  {previewErrors.map((e, i) => (
                    <div key={i} className="text-sm text-red-500">
                      Row {e.row}: {e.message}
                    </div>
                  ))}
                </div>
              )}

              <table className="w-full text-sm border mb-6">
                <thead className="bg-gray-100">
                  <tr>
                    <th>OEM</th>
                    <th>Model</th>
                    <th>Category</th>
                    <th>Fuel</th>
                    <th>Engine</th>
                    <th>Price</th>
                    <th>MOQ</th>
                  </tr>
                </thead>
                <tbody>
                  {uploadedProducts.map((p, i) => (
                    <tr key={i} className="border-t">
                      <td>{p.oemName}</td>
                      <td>{p.modelName}</td>
                      <td>{p.category}</td>
                      <td>{p.fuelType}</td>
                      <td>{p.engineCapacity}</td>
                      <td>₹{p.exShowroomPrice}</td>
                      <td>{p.moq}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end gap-4">
                <button
                  className="px-4 py-2 border rounded"
                  onClick={() => setShowPreviewModal(false)}
                >
                  Cancel
                </button>

                <button
                  className="px-4 py-2 bg-indigo-600 text-white rounded"
                  disabled={uploadedProducts.length === 0}
                  onClick={async () => {
                    setUploading(true);

                    for (const p of uploadedProducts) {
                      await fetch('/api/seller/catalogue', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          ...p,
                          status: 'PUBLISHED'
                        }),
                      });
                    }

                    await fetchCatalogue();
                    setUploading(false);
                    setShowPreviewModal(false);
                  }}
                >
                  {uploading ? "Publishing..." : "Publish Valid Rows"}
                </button>
              </div>

            </div>
          </div>
        )}
        {showPaymentModal && selectedOrder && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">

            <div className="bg-white p-6 rounded shadow-md w-[450px]">

              <h3 className="text-lg font-bold mb-4">Payment Verification</h3>

              {/* ================= ORDER INFO ================= */}
              <div className="text-sm mb-3">
                <p><b>Order ID:</b> {selectedOrder.orderId}</p>
                <p><b>Buyer:</b> {selectedOrder.buyerName || selectedOrder.buyerId}</p>
                <p><b>Seller:</b> {selectedOrder.sellerName}</p>
                <p><b>RFQ ID:</b> {selectedOrder.rfqId}</p>
              </div>

              <hr className="my-2" />

              {/* ================= PAYMENT INFO ================= */}
              <div className="text-sm mb-3">
                <p><b>UTR / Ref:</b> {selectedOrder.paymentRef || "—"}</p>
                <p>
                  <b>Date:</b>{" "}
                  {selectedOrder.paymentDate
                    ? new Date(selectedOrder.paymentDate).toLocaleDateString()
                    : "—"}
                </p>
              </div>

              <hr className="my-2" />

              {/* ================= FINANCIAL ================= */}
              <div className="text-sm mb-3">
                <p><b>Proforma Amount:</b> ₹ {selectedOrder.unitPrice || 0}</p>
                <p><b>Amount Paid:</b> ₹ {selectedOrder.amountPaid || 0}</p>

                <p>
                  <b>Difference:</b>{" "}
                  ₹ {(selectedOrder.amountPaid || 0) - (selectedOrder.unitPrice || 0)}
                </p>

                {Number(selectedOrder.amountPaid) === Number(selectedOrder.unitPrice) ? (
                  <p className="text-green-600 font-semibold">✔ Payment Matched</p>
                ) : (
                  <p className="text-red-600 font-semibold">⚠ Payment Mismatch</p>
                )}
              </div>

              {/* ================= ACTION ================= */}
              <div className="flex justify-between mt-5">

                <button
                  className="bg-gray-500 text-white px-3 py-1 rounded"
                  onClick={() => {
                    setShowPaymentModal(false)
                    setSelectedOrder(null)
                  }}
                >
                  Close
                </button>

                <button
                  className={`px-3 py-1 rounded text-white ${Number(selectedOrder.amountPaid) === Number(selectedOrder.unitPrice)
                    ? "bg-green-600"
                    : "bg-gray-300 cursor-not-allowed"
                    }`}
                  disabled={
                    Number(selectedOrder.amountPaid) !== Number(selectedOrder.unitPrice)
                  }
                  onClick={async () => {

                    const res = await fetch("/api/payment/release-receipt", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        orderId: selectedOrder.orderId
                      })
                    })

                    if (!res.ok) {
                      alert("Failed to release receipt")
                      return
                    }

                    alert("Receipt released successfully")

                    setShowPaymentModal(false)
                    setSelectedOrder(null)

                    window.location.reload()
                  }}
                >
                  Approve & Release Receipt
                </button>

              </div>

            </div>
          </div>
        )}
        {/* ================= RFQS ================= */}

        {tab === 'rfqs' && USER_ROLE === 'seller' && (
          <div className="space-y-4">

            {/* ================= HEADER ================= */}
            <div className="bg-white p-4 rounded-2xl border shadow-sm flex justify-between items-center">
              <h3 className="font-semibold text-lg">RFQs Received</h3>

              <span className="text-sm text-gray-500">
                {sellerRFQs.length} RFQs
              </span>
              <button
                onClick={() => exportToExcel(sellerRFQs, "rfqs_received")}
                className="text-sm bg-indigo-600 text-white px-3 py-1 rounded"
              >
                Download RFQs
              </button>

            </div>

            {/* ================= TABLE ================= */}
            <div className="bg-white p-5 rounded-2xl border shadow-sm overflow-x-auto">

              <table className="w-full text-sm border-separate border-spacing-y-2">

                <thead>
                  <tr className="text-gray-500 text-xs">
                    <th className="text-left p-2">RFQ ID</th>
                    <th className="p-2">Buyer</th>
                    <th className="p-2">Type</th>
                    <th className="p-2">Models</th>
                    <th className="p-2">Total Qty</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {sellerRFQs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-gray-400">
                        No RFQs available
                      </td>
                    </tr>
                  ) : (
                    sellerRFQs.map((r: any) => {

                      const items = Array.isArray(r.items) ? r.items : [];
                      let scopeDisplay = '';
                      let totalQty = 0;

                      if (r.rfqType === 'MODEL') {
                        scopeDisplay = items
                          .map((i: any) => i.modelName || '—')
                          .join(', ');

                        totalQty = items.reduce((sum: number, i: any) => {
                          const locQty = (i.locations || []).reduce(
                            (s: number, l: any) => s + Number(l.qty || 0),
                            0
                          );
                          return sum + locQty;
                        }, 0);
                      } else {
                        const b = items[0] || {};
                        scopeDisplay = `${b.fuelType || ''} ${b.vehicleType || ''} 
                (${b.minSpec || ''}-${b.maxSpec || ''})`;

                        totalQty = (b.locations || []).reduce(
                          (sum: number, l: any) => sum + Number(l.qty || 0),
                          0
                        );
                      }

                      return (
                        <tr
                          key={r.rfqId}
                          className="bg-gray-50 hover:bg-gray-100 transition rounded-lg shadow-sm"
                        >
                          <td className="p-2 font-medium">
                            <span
                              className="text-indigo-600 hover:underline cursor-pointer"
                              onClick={() => {
                                setSelectedRfq(r)
                                setActiveModal("viewRFQ")
                              }}
                            >
                              {r.rfqId}
                            </span>
                          </td>

                          <td className="p-2">{r.buyerName || 'Corporate'}</td>

                          <td className="p-2">{r.rfqType}</td>

                          <td className="p-2 text-gray-600">
                            {scopeDisplay || '—'}
                          </td>

                          <td className="p-2 font-semibold">{totalQty}</td>

                          {/* STATUS (UI ONLY IMPROVED) */}
                          <td className="p-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium
                        ${r.status === 'OPEN'
                                  ? 'bg-green-100 text-green-700'
                                  : r.status === 'RESPONDED'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-gray-200 text-gray-600'
                                }`}
                            >
                              {r.status}
                            </span>
                          </td>

                          {/* ACTIONS (UNCHANGED LOGIC) */}
                          <td className="p-2">
                            <div className="flex flex-wrap gap-2">

                              <button
                                className="px-3 py-1 rounded-lg text-xs bg-gray-700 text-white hover:bg-gray-800 transition"
                                onClick={() => {
                                  setSelectedRfq(r);
                                  setActiveModal('viewRFQ');
                                }}
                              >
                                View RFQ
                              </button>

                              {r.status === 'OPEN' && (
                                <button
                                  className="px-3 py-1 rounded-lg text-xs bg-indigo-600 text-white hover:bg-indigo-700 transition"
                                  onClick={() => {
                                    setSelectedRfq(r);
                                    setActiveModal('respondRFQ');
                                  }}
                                >
                                  Respond
                                </button>
                              )}

                              {r.status === 'RESPONDED' && (
                                <>
                                  <button
                                    className="px-3 py-1 rounded-lg text-xs bg-gray-600 text-white hover:bg-gray-700 transition"
                                    onClick={() => viewQuotation(r)}
                                  >
                                    View
                                  </button>

                                  <button
                                    className="px-3 py-1 rounded-lg text-xs bg-green-600 text-white hover:bg-green-700 transition"
                                    onClick={() => downloadQuotation(r)}
                                  >
                                    Download
                                  </button>

                                  <button
                                    className="px-3 py-1 rounded-lg text-xs bg-indigo-600 text-white hover:bg-indigo-700 transition"
                                    onClick={() => sendQuotation(r)}
                                  >
                                    Send
                                  </button>
                                </>
                              )}

                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>

              </table>
            </div>

          </div>
        )}

        {/* ================= ORDERS ================= */}
        {tab === 'orders' && (
          <div className="space-y-4">

            {/* ================= HEADER ================= */}
            <div className="bg-white p-4 rounded-2xl border shadow-sm flex justify-between items-center">
              <h3 className="font-semibold text-lg">Orders</h3>
              <span className="text-sm text-gray-500">
                {sellerOrders.length} Orders
              </span>
              <button
                onClick={() => exportToExcel(sellerOrders, "orders")}
                className="text-sm bg-indigo-600 text-white px-3 py-1 rounded"
              >
                Download Orders
              </button>

            </div>

            {/* ================= TABLE ================= */}
            <div className="bg-white p-5 rounded-2xl border shadow-sm overflow-x-auto">

              <table className="w-full text-sm border-separate border-spacing-y-2">

                <thead>
                  <tr className="text-gray-500 text-xs">
                    <th className="text-left p-2">Order ID</th>
                    <th className="p-2">Buyer</th>
                    <th className="p-2">Items</th>
                    <th className="p-2">Order Value</th>
                    <th className="p-2">Delivery</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {sellerOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center p-6 text-gray-400">
                        No orders yet
                      </td>
                    </tr>
                  ) : (
                    sellerOrders.map((o: any) => (
                      <tr
                        key={o.orderId}
                        className="bg-gray-50 hover:bg-gray-100 transition rounded-lg shadow-sm"
                      >
                        <td className="p-2 font-medium">
                          <span
                            className="text-indigo-600 hover:underline cursor-pointer"
                            onClick={() => {
                              setSelectedOrder(o)
                              setActiveModal("viewOrder")
                            }}
                          >
                            {o.orderId}
                          </span>
                        </td>

                        <td className="p-2">
                          {o.buyerName || o.buyerId}
                        </td>

                        <td className="p-2 text-gray-600">
                          {Array.isArray(o.items) && o.items.length > 0
                            ? o.items
                              .map((i: any) =>
                                `${i.modelName || 'Model'} (${i.requestedQty || 0})`
                              )
                              .join(', ')
                            : '—'}
                        </td>

                        <td className="p-2 font-semibold">
                          {o.totalQty ? `${o.totalQty} units` : '—'}
                        </td>

                        <td className="p-2">
                          {o.orderValue ? `₹${o.orderValue}` : '—'}
                        </td>

                        <td className="p-2">
                          {o.deliveryTimeline
                            ? `${o.deliveryTimeline} days`
                            : '—'}
                        </td>

                        {/* STATUS BADGE (UI ONLY) */}
                        <td className="p-2">
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                            {o.status}
                          </span>
                        </td>

                        {/* ACTIONS (UNCHANGED LOGIC) */}
                        <td className="p-2">
                          <div className="flex flex-wrap gap-2">

                            {/* VIEW */}
                            <button
                              className="px-3 py-1 rounded-lg text-xs bg-gray-700 text-white hover:bg-gray-800 transition"
                              onClick={() => {
                                setSelectedOrder(o)
                                setActiveModal("viewOrder")
                              }}
                            >
                              View
                            </button>

                            {/* PROFORMA */}
                            <button
                              className="px-3 py-1 rounded-lg text-xs bg-indigo-600 text-white hover:bg-indigo-700 transition"
                              onClick={() => generateProforma(o.orderId)}
                            >
                              {o.proformaGenerated
                                ? "Download Proforma"
                                : "Generate Proforma"}
                            </button>

                            {/* VERIFY PAYMENT */}
                            {o.paymentStatus === "SUBMITTED" && (
                              <button
                                className="px-3 py-1 rounded-lg text-xs bg-yellow-600 text-white hover:bg-yellow-700 transition"
                                onClick={() => {
                                  setSelectedOrder(o)
                                  setActiveModal(null)
                                  setShowPaymentModal(true)
                                }}
                              >
                                Verify Payment
                              </button>
                            )}

                            {/* DOWNLOAD RECEIPT */}
                            {o.paymentStatus === "RECEIPT_ISSUED" && (
                              <button
                                className="px-3 py-1 rounded-lg text-xs bg-green-600 text-white hover:bg-green-700 transition"
                                onClick={async () => {
                                  try {
                                    const res = await fetch(`/api/documents/receipt/pdf?orderId=${o.orderId}`)

                                    if (!res.ok) {
                                      alert("Receipt not available")
                                      return
                                    }

                                    const blob = await res.blob()
                                    const url = window.URL.createObjectURL(blob)

                                    const a = document.createElement("a")
                                    a.href = url
                                    a.download = `Receipt-${o.orderId}.pdf`
                                    a.click()

                                  } catch (err) {
                                    console.error(err)
                                    alert("Error downloading receipt")
                                  }
                                }}
                              >
                                Download Receipt
                              </button>
                            )}

                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>

              </table>
            </div>

          </div>
        )}


        {tab === 'beneficiaries' && (
          <div className="space-y-6">

            {/* ================= HEADER ================= */}
            <div className="bg-white p-4 rounded-2xl border shadow-sm flex justify-between items-center">
              <h3 className="font-semibold text-lg">Beneficiaries</h3>

              <span className="text-sm text-gray-500">
                {orderBeneficiaries.length} Records
              </span>
              <button
                onClick={() => {
                  const flat = orderBeneficiaries.map((b: any, i: number) => ({
                    beneficiaryId: `BEN-${i + 1}`,
                    orderId: b.orderId,
                    name: b.beneficiary?.name,
                    mobile: b.beneficiary?.mobile,
                    city: b.beneficiary?.city,
                    pincode: b.beneficiary?.pincode,
                    status: b.voucherStatus
                  }))

                  exportToExcel(flat, "beneficiaries")
                }}
                className="text-sm bg-indigo-600 text-white px-3 py-1 rounded"
              >
                Download Beneficiaries
              </button>
            </div>

            {/* ================= ALLOCATION SUMMARY ================= */}
            {allocationSummary.length > 0 && (
              <div className="bg-white p-5 rounded-2xl border shadow-sm">
                <h3 className="font-semibold mb-4 text-gray-700">
                  Allocation Summary
                </h3>

                <table className="w-full text-sm border-separate border-spacing-y-2">
                  <thead>
                    <tr className="text-gray-500 text-xs">
                      <th className="text-left p-2">Model</th>
                      <th className="p-2">City</th>
                      <th className="p-2">Allocated</th>
                      <th className="p-2">Required</th>
                    </tr>
                  </thead>

                  <tbody>
                    {allocationSummary.map((row, i) => (
                      <tr
                        key={i}
                        className="bg-gray-50 hover:bg-gray-100 transition rounded-lg shadow-sm"
                      >
                        <td className="p-2 font-medium">{row.model}</td>
                        <td className="p-2">{row.city}</td>
                        <td className="p-2 text-green-600 font-semibold">
                          {row.assigned}
                        </td>
                        <td className="p-2 text-indigo-600 font-semibold">
                          {row.required}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ================= BENEFICIARY TABLE ================= */}
            <div className="bg-white p-5 rounded-2xl border shadow-sm overflow-x-auto">

              <table className="w-full text-sm border-separate border-spacing-y-2">

                <thead>
                  <tr className="text-gray-500 text-xs">
                    <th className="text-left p-2">Beneficiary ID</th>
                    <th className="text-left p-2">Order ID</th>
                    <th className="p-2">Beneficiary</th>
                    <th className="p-2">Mobile</th>
                    <th className="p-2">City</th>
                    <th className="p-2">Pincode</th>
                    <th className="p-2">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {orderBeneficiaries.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center text-gray-400 p-6">
                        No beneficiaries assigned yet
                      </td>
                    </tr>
                  ) : (
                    orderBeneficiaries.map((b: any, i: number) => (
                      <tr
                        key={i}
                        className="bg-gray-50 hover:bg-gray-100 transition rounded-lg shadow-sm"
                      >
                        <td className="p-2 font-medium">
                          {`BEN-${i + 1}`}
                        </td>
                        <td className="p-2">{b.orderId}</td>
                        <td className="p-2">
                          {b.beneficiary?.name}
                        </td>
                        <td className="p-2">
                          {b.beneficiary?.mobile}
                        </td>
                        <td className="p-2 text-gray-600">
                          {b.beneficiary?.city}
                        </td>
                        <td className="p-2">
                          {b.beneficiary?.pincode}
                        </td>
                        {/* STATUS BADGE */}
                        <td className="p-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium
                      ${b.voucherStatus === 'ISSUED'
                                ? 'bg-green-100 text-green-700'
                                : b.voucherStatus === 'MAPPED'
                                  ? 'bg-blue-100 text-blue-700'
                                  : b.voucherStatus === 'NO_RESELLER'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-gray-200 text-gray-600'
                              }`}
                          >
                            {b.voucherStatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {/* ================= REDEMPTIONS ================= */}
        {tab === 'redemptions' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border shadow-sm">
              <div className="flex justify-between items-center mb-4">

                <span className="text-sm text-gray-500">
                  {redemptions.length} Records
                </span>
              </div>
              <table className="w-full text-sm border-separate border-spacing-y-2">
                <tbody>
                  {redemptions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center text-gray-400 p-6">
                        No redemptions yet
                      </td>
                    </tr>
                  ) : (
                    redemptions.map(r => (
                      <tr key={r.id} className="bg-gray-50 hover:bg-gray-100 rounded-lg">
                        <td className="p-2 font-medium">{r.id}</td>
                        <td className="p-2">{r.dealer}</td>
                        <td className="p-2 font-semibold text-green-600">₹{r.amount}</td>
                        <td className="p-2 text-gray-600">{r.date}</td>
                      </tr>
                    ))
                  )}
                </tbody>

              </table>
            </div>


            {/* ================= ISSUED VOUCHERS ================= */}
            {/* ================= ISSUED VOUCHERS ================= */}
            <div className="bg-white p-5 rounded-2xl border shadow-sm">

              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">Issued Vouchers</h3>
                <span className="text-sm text-gray-500">
                  {vouchers.length} Vouchers
                </span>
              </div>

              <table className="w-full text-sm border-separate border-spacing-y-2">

                <thead>
                  <tr className="text-gray-500 text-xs">
                    <th className="text-left p-2">Voucher Code</th>
                    <th className="p-2">Order ID</th>
                    <th className="p-2">Corporate</th>
                    <th className="p-2">Beneficiary</th>
                    <th className="p-2">Value</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Valid Till</th>
                  </tr>
                </thead>

                <tbody>
                  {vouchers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center text-gray-400 p-6">
                        No vouchers issued
                      </td>
                    </tr>
                  ) : (
                    vouchers.map((v: any) => (
                      <tr
                        key={v.voucherId}
                        className="bg-gray-50 hover:bg-gray-100 transition rounded-lg"
                      >
                        {/* Voucher Code */}
                        <td className="p-2">
                          <button
                            className="text-indigo-600 hover:underline font-medium"
                            onClick={() => {
                              setSelectedVoucher(v);
                              setShowVoucherModal(true);
                            }}
                          >
                            {v.voucherId}
                          </button>
                        </td>

                        {/* Clickable Order ID */}
                        <td className="p-2">
                          <button
                            className="text-indigo-600 hover:underline"
                            onClick={() => {
                              setSelectedOrder(v.orderId);
                              setShowOrderSummary(true);
                            }}
                          >
                            {v.orderId}
                          </button>
                        </td>

                        {/* Corporate */}
                        <td className="p-2">Corporate</td>

                        {/* Beneficiary */}
                        <td className="p-2">
                          {v.beneficiary?.name || "-"}
                        </td>

                        {/* Value */}
                        <td className="p-2 font-semibold">
                          ₹{v.value}
                        </td>

                        {/* Status */}
                        <td className="p-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium
                  ${v.status === 'REDEEMED'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-blue-100 text-blue-700'
                              }`}
                          >
                            {v.status}
                          </span>
                        </td>

                        {/* Valid Till */}
                        <td className="p-2 text-gray-600">
                          {v.validTill
                            ? new Date(v.validTill).toLocaleDateString()
                            : "-"}
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>

              </table>

            </div>


            {/* ================= ORDER MODAL ================= */}
            {showOrderSummary && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-xl w-full max-w-3xl">

                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-lg">Order Summary</h3>

                    <button
                      className="border px-3 py-1 rounded"
                      onClick={() => setShowOrderSummary(false)}
                    >
                      Close
                    </button>
                  </div>

                  {/* SUMMARY */}
                  {/* ================= ORDER SUMMARY GRID ================= */}
                  {(() => {
                    const orderVouchers = vouchers.filter(
                      (v: any) => v.orderId === selectedOrder
                    );

                    const redeemedCount = orderVouchers.filter(
                      (v: any) =>
                        v.status === "REDEEMED" || v.status === "Redeemed"
                    ).length;

                    const activeCount = orderVouchers.length - redeemedCount;

                    return (
                      <div className="grid md:grid-cols-2 gap-4 mb-6">

                        <p>
                          <strong>Order ID:</strong> {selectedOrder}
                        </p>

                        <p>
                          <strong>Total Vouchers:</strong> {orderVouchers.length}
                        </p>

                        <p>
                          <strong>Redeemed:</strong> {redeemedCount}
                        </p>

                        <p>
                          <strong>Active:</strong> {activeCount}
                        </p>

                        <p>
                          <strong>Redemption %:</strong>{" "}
                          {orderVouchers.length > 0
                            ? Math.round((redeemedCount / orderVouchers.length) * 100)
                            : 0}%
                        </p>

                      </div>
                    );
                  })()}

                  {/* DOWNLOAD */}
                  <div className="flex justify-end">
                    <button
                      className="bg-indigo-600 text-white px-4 py-2 rounded"
                      onClick={async () => {
                        const res = await fetch(
                          `/api/documents/voucher/bundle?orderId=${selectedOrder}`
                        );

                        if (!res.ok) {
                          alert("Download failed");
                          return;
                        }

                        const blob = await res.blob();
                        const url = window.URL.createObjectURL(blob);

                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `Vouchers-${selectedOrder}.zip`;
                        a.click();

                        window.URL.revokeObjectURL(url);
                      }}
                    >
                      Download All Vouchers
                    </button>
                  </div>

                </div>
              </div>
            )}

          </div>
        )}

        {/* ================= RESELLERS ================= */}





        {/* ================= RESELLERS ================= */}
        {tab === 'resellers' && (
          <div className="space-y-6">

            {/* ================= PENDING APPROVALS ================= */}
            <div className="bg-white p-5 rounded-2xl border shadow-sm">
              <h3 className="font-semibold mb-4 text-red-600">
                Pending Reseller Approvals
              </h3>

              {pendingResellers.length === 0 ? (
                <p className="text-sm text-gray-500">No pending approvals</p>
              ) : (
                <table className="w-full text-sm border-separate border-spacing-y-2">
                  <thead>
                    <tr className="text-gray-500 text-xs">
                      <th className="p-2 text-left">Username</th>
                      <th className="p-2">Company</th>
                      <th className="p-2">GST</th>
                      <th className="p-2">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {pendingResellers.map((r: any) => (
                      <tr
                        key={r.userId}
                        className="bg-gray-50 hover:bg-gray-100 transition rounded-lg shadow-sm text-center"
                      >
                        <td className="p-2">{r.username}</td>
                        <td className="p-2">{r.companyName}</td>
                        <td className="p-2">{r.gstNumber}</td>

                        <td className="p-2 space-x-2">
                          <button
                            className="px-3 py-1 rounded-lg text-xs bg-green-600 text-white hover:bg-green-700 transition"
                            onClick={() => handleApproval(r.userId, "APPROVE")}
                          >
                            Approve
                          </button>

                          <button
                            className="px-3 py-1 rounded-lg text-xs bg-red-600 text-white hover:bg-red-700 transition"
                            onClick={() => handleApproval(r.userId, "REJECT")}
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>


            {/* ================= ADD RESELLER ================= */}
            <div className="bg-white p-5 rounded-2xl border shadow-sm">
              <h3 className="font-semibold mb-4">Add Reseller</h3>

              <div className="grid md:grid-cols-3 gap-4">

                <input className="border rounded-lg p-2" placeholder="Reseller Code (AMDs)" id="r_code" />
                <input className="border rounded-lg p-2" placeholder="Company / Dealer Name" id="r_company" />
                <input className="border rounded-lg p-2" placeholder="Contact Name" id="r_name" />

                <input className="border rounded-lg p-2" placeholder="Mobile" id="r_mobile" />
                <input className="border rounded-lg p-2" placeholder="Email" id="r_email" />
                <input className="border rounded-lg p-2" placeholder="City" id="r_city" />

                <input className="border rounded-lg p-2" placeholder="State" id="r_state" />
                <input className="border rounded-lg p-2" placeholder="Pin Code" id="r_pincode" />

                <select className="border rounded-lg p-2" id="r_status">
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>

              {/* BULK UPLOAD */}
              <div className="mt-6">
                <h4 className="font-medium mb-2">Bulk Upload Resellers</h4>

                <div className="flex flex-wrap gap-3 items-center">
                  <input
                    ref={resellerFileRef}
                    type="file"
                    accept=".xlsx,.xls"
                    className="border rounded-lg p-2 text-sm"
                    onChange={e =>
                      e.target.files && handleResellerExcel(e.target.files[0])
                    }
                  />

                  <button
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                    onClick={addReseller}
                  >
                    Add Reseller
                  </button>
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  Excel format: ResellerCode, Company, ContactName, Mobile, Email, City, State, PinCode, Status
                </p>
              </div>
            </div>


            {/* ================= REGISTERED RESELLERS ================= */}
            <div className="bg-white p-5 rounded-2xl border shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Registered Resellers</h3>

                <span className="text-sm text-gray-500">
                  {resellers.length} Resellers
                </span>
                <button
                  onClick={() => exportToExcel(resellers, "registered_resellers")}
                  className="text-sm bg-indigo-600 text-white px-3 py-1 rounded"
                >
                  Download Resellers
                </button>
              </div>

              {resellers.length === 0 ? (
                <p className="text-sm text-gray-500">No resellers added yet.</p>
              ) : (
                <table className="w-full text-sm border-separate border-spacing-y-2">
                  <thead>
                    <tr className="text-gray-500 text-xs">
                      <th className="p-2 text-left">Code</th>
                      <th className="p-2">Company</th>
                      <th className="p-2">Contact</th>
                      <th className="p-2">City</th>
                      <th className="p-2">State</th>
                      <th className="p-2">Pin</th>
                      <th className="p-2">Mobile</th>
                      <th className="p-2">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {resellers.map((r, i) => (
                      <tr
                        key={i}
                        className="bg-gray-50 hover:bg-gray-100 transition rounded-lg shadow-sm"
                      >
                        <td className="p-2 font-medium">{r.resellerCode}</td>
                        <td className="p-2">{r.companyName}</td>
                        <td className="p-2">{r.contactName}</td>
                        <td className="p-2 text-gray-600">{r.city}</td>
                        <td className="p-2">{r.state}</td>
                        <td className="p-2">{r.pincode}</td>
                        <td className="p-2">{r.mobile}</td>

                        <td className="p-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium
                      ${r.status === 'Active'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-200 text-gray-600'
                              }`}
                          >
                            {r.status}
                          </span>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

          </div>
        )}

      </div>
    </>
  );

}