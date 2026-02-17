'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import * as XLSX from 'xlsx';



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
  type ModalType =
    | null
    | 'respondRFQ'
    | 'viewOrder'
    | 'issueVoucher';

  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedRfq, setSelectedRfq] = useState<any | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const USER_ROLE = 'seller';
  const [tab, setTab] = useState<
    'catalogue' | 'rfqs' | 'orders' | 'beneficiaries' | 'redemptions' | 'resellers'
  >('catalogue');

  /* ---------- STATES ---------- */

  const [catalogue, setCatalogue] = useState<any[]>([]);
  const [loadingCatalogue, setLoadingCatalogue] = useState(true);

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
  const [sellerOrders, setSellerOrders] = useState<any[]>([]);
  const [orderBeneficiaries, setOrderBeneficiaries] = useState<any[]>([]);

  useEffect(() => {
    if (tab === 'beneficiaries') {
      fetch('/api/seller/order/beneficiaries?sellerId=SELLER_001')
        .then(res => res.json())
        .then(setOrderBeneficiaries);
    }
  }, [tab]);
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

        quotedUnitPrice: Number(bidForm.quotedUnitPrice),
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
  const handleProductExcel = (file: File) => {
    console.log('Product Excel uploaded:', file.name);
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


  /* ================= RENDER ================= */

  return (
    <>
      <TopNav />

      <div className="min-h-screen bg-gray-50 p-8">
        <h1 className="text-3xl font-bold mb-6">Sellers Dashboard</h1>

        {/* KPI */}
        <div className="grid grid-cols-4 gap-6 mb-10">
          {KPI.map(k => (
            <div key={k.label} className="bg-white rounded-xl shadow p-6">
              <p className="text-sm text-gray-500">{k.label}</p>
              <p className="text-2xl font-bold">{k.value}</p>
            </div>
          ))}
        </div>
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
                <p><strong>Buyer:</strong> {selectedRfq.buyerId}</p>
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
                    <th className="p-2">Requested Qty</th>
                    <th className="p-2">Quoted Unit Price (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedRfq.items.map((item: any, idx: number) => (
                    <tr key={idx} className="border-t">
                      <td className="p-2">{item.modelName}</td>
                      <td className="p-2 text-center">{item.requestedQty}</td>
                      <td className="p-2">
                        <input
                          type="number"
                          className="border p-1 w-full"
                          placeholder="Enter price"
                          onChange={(e) => {
                            const value = Number(e.target.value);
                            setSelectedRfq((prev: any) => ({
                              ...prev,
                              items: prev.items.map((it: any, i: number) =>
                                i === idx ? { ...it, quotedPrice: value } : it
                              )
                            }));
                          }}

                        />
                      </td>
                    </tr>
                  ))}
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
        {/* TABS */}
        {/* TABS */}
        <div className="flex gap-6 mb-6 border-b">
          {(['catalogue', 'rfqs', 'orders', 'beneficiaries', 'redemptions', 'resellers'] as const).map(
            t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`pb-2 ${tab === t
                  ? 'font-semibold border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-black'
                  }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            )
          )}
        </div>


        {/* ================= CATALOGUE ================= */}
        {tab === 'catalogue' && (
          <div className="bg-white p-6 rounded-xl shadow">
            {/* Add + Bulk Upload */}
            <div className="grid md:grid-cols-2 gap-8 mb-6">
              <div>
                <h3 className="font-semibold mb-2">Add Catalogue Item</h3>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    className="border p-2"
                    placeholder="Model Name"
                    value={form.modelName}
                    onChange={e =>
                      setForm({ ...form, modelName: e.target.value })
                    }
                  />
                  <select
                    className="border p-2"
                    value={form.category}
                    onChange={e =>
                      setForm({ ...form, category: e.target.value })
                    }
                  >
                    <option value="">Select</option>
                    <option value="2W EV">2W EV</option>
                    <option value="2W ICE">2W ICE</option>
                  </select>
                  <input
                    className="border p-2"
                    placeholder="Engine"
                    value={form.engine}
                    onChange={e =>
                      setForm({ ...form, engine: e.target.value })
                    }
                  />
                  <input
                    className="border p-2"
                    placeholder="Price"
                    value={form.price}
                    onChange={e =>
                      setForm({ ...form, price: e.target.value })
                    }
                  />
                  <input
                    className="border p-2"
                    placeholder="MOQ"
                    value={form.moq}
                    onChange={e =>
                      setForm({ ...form, moq: e.target.value })
                    }
                  />
                </div>

                <button
                  className="mt-4 bg-indigo-600 text-white px-4 py-2"
                  onClick={handlePublishCatalogue}
                >
                  Publish
                </button>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Bulk Upload Catalogue</h3>
                <input
                  ref={productFileRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={e =>
                    e.target.files && handleProductExcel(e.target.files[0])
                  }
                />
              </div>
            </div>

            {/* Catalogue Table */}
            <table className="w-full text-sm border">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="p-2 text-left">Model</th>
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
                    <td colSpan={7} className="p-4 text-center text-gray-400">
                      No catalogue items published yet
                    </td>
                  </tr>
                ) : (
                  filteredPublishedProducts.map((p, i) => (
                    <tr key={p.id || i} className="border-t">
                      <td className="p-2">{p.model || p.modelName}</td>

                      <td className="p-2">{p.category}</td>
                      <td className="p-2">{p.engineCapacity || '—'}</td>
                      <td className="p-2">₹{p.exShowroomPrice}</td>

                      <td className="p-2">{p.moq}</td>
                      <td className="p-2">
                        <span className="text-green-600 font-medium">Published</span>
                      </td>
                      <td className="p-2">
                        <button
                          onClick={() => handleDiscontinue(p.id)}
                          disabled={discontinuingId === p.id}
                          className={`px-3 py-1 rounded text-sm
                ${discontinuingId === p.id
                              ? 'bg-gray-300 text-gray-600'
                              : 'bg-red-600 text-white hover:bg-red-700'
                            }`}
                        >
                          {discontinuingId === p.id ? 'Discontinuing…' : 'Discontinue'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

          </div>
        )}

        {/* ================= RFQS ================= */}
        {tab === 'rfqs' && USER_ROLE === 'seller' && (
          <div className="bg-white p-6 rounded-xl shadow">
            <table className="w-full text-sm border">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-2 text-left">RFQ ID</th>
                  <th className="p-2 text-left">Type</th>
                  <th className="p-2 text-left">Models</th>
                  <th className="p-2 text-left">Total Qty</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Action</th>
                </tr>
              </thead>



              <tbody>
                {sellerRFQs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center p-4 text-gray-400">
                      No RFQs available
                    </td>
                  </tr>
                ) : (
                  sellerRFQs.map((r: any) => {
                    const items = Array.isArray(r.items) ? r.items : [];

                    const models = items
                      .map((i: any) => i.modelName || '—')
                      .join(', ');

                    const totalQty = items.reduce(
                      (sum: number, i: any) =>
                        sum + Number(i.requestedQty || 0),
                      0
                    );

                    return (
                      <tr key={r.rfqId} className="border-t">
                        <td className="p-2">{r.rfqId}</td>

                        <td className="p-2">{r.rfqType}</td>

                        <td className="p-2">{models || '—'}</td>

                        <td className="p-2">{totalQty}</td>

                        <td className="p-2">
                          <span className="font-medium">
                            {r.status}
                          </span>
                        </td>

                        <td className="p-2">
                          {r.status === 'OPEN' && (
                            <button
                              className="px-3 py-1 bg-indigo-600 text-white rounded text-sm"
                              onClick={() => {
                                setSelectedRfq(r);
                                setActiveModal('respondRFQ');
                              }}

                            >
                              Respond
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>


            </table>
          </div>
        )}

        {/* ================= ORDERS ================= */}
        {tab === 'orders' && (
          <div className="bg-white p-6 rounded-xl shadow">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="p-2 text-left">Order ID</th>
                  <th className="p-2 text-left">Buyer</th>
                  <th className="p-2 text-left">Items</th>
                  <th className="p-2 text-left">Order Value</th>
                  <th className="p-2 text-left">Delivery</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Action</th>
                </tr>
              </thead>

              <tbody>
                {sellerOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center p-4 text-gray-400">
                      No orders yet
                    </td>
                  </tr>
                ) : (
                  sellerOrders.map((o: any) => (
                    <tr key={o.orderId} className="border-t">
                      <td className="p-2">{o.orderId}</td>

                      <td className="p-2">
                        {o.buyerName || o.buyerId}
                      </td>

                      <td className="p-2">
                        {Array.isArray(o.items) && o.items.length > 0
                          ? o.items
                            .map((i: any) =>
                              `${i.modelName || 'Model'} (${i.requestedQty || 0})`
                            )
                            .join(', ')
                          : '—'}
                      </td>
                      <td className="p-2">
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

                      <td className="p-2">
                        <span className="text-green-600 font-medium">
                          {o.status}
                        </span>
                      </td>

                      <td className="p-2">
                        <span className="text-gray-500">—</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}


        {tab === 'beneficiaries' && (
          <Card>
            <CardHeader>
              <CardTitle>Beneficiaries</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Beneficiary</th>
                    <th>Mobile</th>
                    <th>City</th>
                    <th>Pincode</th>
                    <th>Voucher Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orderBeneficiaries.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center text-gray-400 p-4">
                        No beneficiaries assigned yet
                      </td>
                    </tr>
                  ) : (
                    orderBeneficiaries.map((b, i) => (
                      <tr key={i} className="border-t">
                        <td>{b.orderId}</td>
                        <td>{b.beneficiary?.name}</td>
                        <td>{b.beneficiary?.mobile}</td>
                        <td>{b.beneficiary?.city}</td>
                        <td>{b.beneficiary?.pincode}</td>
                        <td className="font-medium text-yellow-600">
                          {b.voucherStatus}
                        </td>
                      </tr>
                    ))

                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}





        {/* ================= REDEMPTIONS ================= */}
        {tab === 'redemptions' && (
          <div className="bg-white p-6 rounded-xl shadow">
            <table className="w-full text-sm">
              <tbody>
                {REDEMPTIONS.map(r => (
                  <tr key={r.id} className="border-t">
                    <td>{r.id}</td>
                    <td>{r.dealer}</td>
                    <td>{r.amount}</td>
                    <td>{r.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h3 className="font-semibold mt-8 mb-4">Issued Vouchers</h3>
            <table className="w-full text-sm">
              <tbody>
                {VOUCHERS.map(v => (
                  <tr key={v.code} className="border-t">
                    <td>{v.code}</td>
                    <td>{v.orderId}</td>
                    <td>{v.beneficiary}</td>
                    <td>{v.value}</td>
                    <td>{v.status}</td>
                    <td>{v.validTill}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ================= RESELLERS ================= */}





        {/* ================= RESELLERS ================= */}
        {tab === 'resellers' && (
          <div className="bg-white p-6 rounded-xl shadow space-y-6">

            {/* ADD RESELLER */}
            <div className="grid md:grid-cols-3 gap-4">

              <input
                className="border p-2 rounded"
                placeholder="Reseller Code (AMDs)"
                id="r_code"
              />

              <input
                className="border p-2 rounded"
                placeholder="Company / Dealer Name"
                id="r_company"
              />

              <input
                className="border p-2 rounded"
                placeholder="Contact Name"
                id="r_name"
              />

              <input
                className="border p-2 rounded"
                placeholder="Mobile"
                id="r_mobile"
              />

              <input
                className="border p-2 rounded"
                placeholder="Email"
                id="r_email"
              />

              <input
                className="border p-2 rounded"
                placeholder="City"
                id="r_city"
              />

              <input
                className="border p-2 rounded"
                placeholder="State"
                id="r_state"
              />

              <input
                className="border p-2 rounded"
                placeholder="Pin Code"
                id="r_pincode"
              />

              <select className="border p-2 rounded" id="r_status">
                <option>Active</option>
                <option>Inactive</option>
              </select>

            </div>




            <div className="mt-6">
              <h3 className="font-semibold mb-2">Bulk Upload Resellers</h3>

              <input
                ref={resellerFileRef}
                type="file"
                accept=".xlsx,.xls"
                className="border p-2"
                onChange={e =>
                  e.target.files && handleResellerExcel(e.target.files[0])
                }
              />
              <button
                className="bg-indigo-600 text-white px-4 py-2 rounded"
                onClick={addReseller}
              >
                Add Reseller
              </button>
              <p className="text-xs text-gray-500 mt-2">
                Excel format: ResellerCode, Company, ContactName, Mobile, Email, City, State, PinCode, Status
              </p>
            </div>

            {/* ===== BULK UPLOAD RESELLERS ===== */}



            {/* LIST RESELLERS */}
            <div>
              <h3 className="font-semibold mb-2">Registered Resellers</h3>

              {resellers.length === 0 ? (
                <p className="text-sm text-gray-500">No resellers added yet.</p>
              ) : (

                <table className="w-full text-sm border">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-2">Reseller Code</th>
                      <th className="p-2">Company</th>
                      <th className="p-2">Contact</th>
                      <th className="p-2">City</th>
                      <th className="p-2">State</th>
                      <th className="p-2">Pin Code</th>
                      <th className="p-2">Mobile</th>
                      <th className="p-2">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {resellers.map((r, i) => (
                      <tr key={i} className="border-t">
                        <td className="p-2">{r.resellerCode}</td>
                        <td className="p-2">{r.companyName}</td>
                        <td className="p-2">{r.contactName}</td>
                        <td className="p-2">{r.city}</td>
                        <td className="p-2">{r.state}</td>
                        <td className="p-2">{r.pincode}</td>
                        <td className="p-2">{r.mobile}</td>
                        <td className="p-2">{r.status}</td>
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