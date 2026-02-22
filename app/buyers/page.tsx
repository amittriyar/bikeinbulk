'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Users, Ticket, IndianRupee, TrendingUp } from "lucide-react";
import TopNav from '@/components/ui/TopNav'
import * as XLSX from "xlsx";


export default function BuyersDashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [buyerRFQs, setBuyerRFQs] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedRfq, setSelectedRfq] = useState<any | null>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [showBidModal, setShowBidModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [vouchers, setVouchers] = useState<any[]>([]);

  const [compareModels, setCompareModels] = useState<any[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [beneficiaryUploadData, setBeneficiaryUploadData] = useState<any[]>([]);



  const fetchVouchers = async () => {
    try {
      const res = await fetch('/api/voucher/list');
      const data = await res.json();
      setVouchers(data || []);
    } catch (err) {
      console.error('Voucher fetch error:', err);
      setVouchers([]);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);






  const [submitting, setSubmitting] = useState(false);
  const [rfqItems, setRfqItems] = useState<any[]>([]);

  const toggleRfqItem = (product: any, checked: boolean) => {
    if (checked) {
      setRfqItems(prev => [
        ...prev,
        {
          catalogueId: product.id,
          modelName: product.modelName,
          requestedQty: product.moq || 1,
          locations: [{ city: '', qty: '' }], // 🔥 per product
        }
      ]);
    } else {
      setRfqItems(prev =>
        prev.filter(item => item.catalogueId !== product.id)
      );
    }
  };


  const [rfqMode, setRfqMode] = useState<'MODEL' | 'BUDGET'>('MODEL');
  const [locationRows, setLocationRows] = useState([{ city: '', qty: '' }]);

  const [filterCategory, setFilterCategory] = useState('All');
  const [filterFuel, setFilterFuel] = useState('All');
  const [filterOEM, setFilterOEM] = useState('All');

  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);


  const [showBeneficiaryUpload, setShowBeneficiaryUpload] = useState(false);
  const [showVoucherDetail, setShowVoucherDetail] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<any | null>(null);

  const [orderBeneficiaries, setOrderBeneficiaries] = useState<any[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rfqDraftActive, setRfqDraftActive] = useState(true);

  const [budgetForm, setBudgetForm] = useState({
    fuelType: '',
    vehicleType: '',
    minBudget: '',
    maxBudget: '',
    minSpec: '',
    maxSpec: '',
    locations: [{ city: '', qty: '' }]
  });



  useEffect(() => {
    fetch(`/api/buyer/order/beneficiaries?buyerId=BUYER_001`)
      .then(res => res.json())
      .then(setOrderBeneficiaries)
      .catch(err => {
        console.error('Beneficiary fetch error:', err);
        setOrderBeneficiaries([]);
      });
  }, []);





  // ─── Missing state ─── added here
  const [beneficiaryForm, setBeneficiaryForm] = useState({
    name: '',
    mobile: '',
    email: '',
    city: '',
    pincode: '',
  });

  // Fetch products (marketplace catalogue)
  useEffect(() => {
    fetch('/api/seller/catalogue/list')

      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error("Failed to load products", err));
  }, []);

  // Fetch buyer's RFQs
  useEffect(() => {
    fetch('/api/buyer/rfq/list?buyerId=BUYER_001')
      .then(r => r.json())
      .then(setBuyerRFQs)
      .catch(err => console.error("Failed to load RFQs", err));
  }, []);

  // Fetch orders
  useEffect(() => {
    fetch('/api/buyer/order/list?buyerId=BUYER_001')
      .then(r => r.json())
      .then(setOrders)
      .catch(err => console.error("Failed to load orders", err));
  }, []);

  const addToRFQ = (p: any) => {
    setRfqItems(prev => [
      ...prev,
      {
        catalogueId: p.id,
        modelName: p.model,
        requestedQty: p.moq || 1,
        locations: [],
      },
    ]);
  };

  const openBids = async (rfq: any) => {
    setSelectedRfq(rfq);
    setShowBidModal(true);

    try {
      const res = await fetch(`/api/buyer/bid/list?rfqId=${rfq.rfqId}`);
      const data = await res.json();
      setBids(data || []);
    } catch (err) {
      console.error("Failed to load bids", err);
      setBids([]);
    }
  };

  const submitRFQ = async () => {
    if (submitting) return;

    if (rfqMode === 'MODEL' && rfqItems.length === 0) return;

    if (rfqMode === 'BUDGET' && totalBudgetQty === 0) return;
    setSubmitting(true);

    const payload = {
      buyerId: 'BUYER_001',
      rfqType: rfqMode,
      items:
        rfqMode === 'MODEL'
          ? rfqItems
          : [
            {
              fuelType: budgetForm.fuelType,
              vehicleType: budgetForm.vehicleType,
              minSpec: budgetForm.minSpec,
              maxSpec: budgetForm.maxSpec,
              minBudget: budgetForm.minBudget,
              maxBudget: budgetForm.maxBudget,
              requestedQty: totalBudgetQty,
              locations: budgetForm.locations
            }
          ]
    };

    try {
      const res = await fetch('/api/buyer/rfq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setRfqItems([]);
        setLocationRows([{ city: '', qty: '' }]);

        // 👇 IMPORTANT
        setRfqDraftActive(false);

        alert("RFQ submitted successfully");
      }
      else {
        alert("Failed to submit RFQ");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting RFQ");
    } finally {
      setSubmitting(false);
    }
  };

  const totalBudgetQty = budgetForm.locations.reduce(
    (sum, loc) => sum + Number(loc.qty || 0),
    0
  );
  const downloadRFQPdf = async (rfqId: string) => {
    const res = await fetch("/api/rfq/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rfqId }),
    });

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${rfqId}.pdf`;
    a.click();
  };

  const submitBeneficiary = async () => {
    if (!beneficiaryForm.name || !beneficiaryForm.mobile) {
      alert('Name and Mobile are mandatory');
      return;
    }

    if (!selectedOrder?.orderId) {
      alert('No order selected');
      return;
    }

    try {
      const res = await fetch('/api/buyer/order/beneficiaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedOrder.orderId,
          sellerId: selectedOrder.sellerId,
          name: beneficiaryForm.name,
          mobile: beneficiaryForm.mobile,
          email: beneficiaryForm.email,
          city: beneficiaryForm.city,
          pincode: beneficiaryForm.pincode,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        alert(text);
        return;
      }

      alert('Beneficiary added successfully');

      // Refresh list
      const updated = await fetch(
        `/api/buyer/order/beneficiaries?orderId=${selectedOrder.orderId}`
      );
      const data = await updated.json();
      setOrderBeneficiaries(data);

      setBeneficiaryForm({
        name: '',
        mobile: '',
        email: '',
        city: '',
        pincode: '',
      });

    } catch (err) {
      console.error(err);
      alert('Error adding beneficiary');
    }
  };



  const lowestPrice = bids.length > 0
    ? Math.min(...bids.map(b => Number(b.quotedUnitPrice || Infinity)))
    : null;

  const l1BidId = useMemo(() => {
    if (!bids?.length) return null;

    const validBids = bids.filter(b => Number(b.quotedUnitPrice) > 0);
    if (!validBids.length) return null;

    return validBids.reduce((min, b) =>
      Number(b.quotedUnitPrice) < Number(min.quotedUnitPrice) ? b : min
    ).bidId;
  }, [bids]);

  const handleSelectL1 = async (bid: any) => {
    try {
      const res = await fetch('/api/buyer/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rfqId: bid.rfqId,
          bidId: bid.bidId,
          sellerId: bid.sellerId,
          sellerName: bid.sellerName,
          unitPrice: bid.quotedUnitPrice,
          moq: bid.moq,
          deliveryTimeline: bid.deliveryTimeline,
          validityDays: bid.validityDays,
          buyerId: 'BUYER_001',
          items: selectedRfq.items,
        }),
      });

      if (res.ok) {
        alert('Order placed successfully');
        setShowBidModal(false);
      } else {
        alert('Failed to place order');
      }
    } catch (err) {
      console.error(err);
      alert('Error placing order');
    }
  };

  const issueVouchers = async () => {
    if (!selectedOrder?.orderId) return;

    try {
      const res = await fetch('/api/voucher/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedOrder.orderId,
          sellerId: selectedOrder.sellerId,
          value: 2000,
          validityDays: 30
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Voucher creation failed');
        return;
      }

      alert(`Created ${data.count} vouchers successfully`);

      // Optional: refresh vouchers
      fetchVouchers();

    } catch (err) {
      console.error(err);
      alert('Something went wrong');
    }
  };


  const issueSingleVoucher = async (row: any) => {
    try {
      const res = await fetch('/api/voucher/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: row.orderId,
          sellerId: row.sellerId,
          value: 2000,
          validityDays: 30
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Voucher creation failed');
        return;
      }

      alert('Voucher issued successfully');

      // Refresh beneficiaries
      fetch(`/api/buyer/order/beneficiaries?buyerId=BUYER_001`)
        .then(r => r.json())
        .then(setOrderBeneficiaries);

      // Refresh vouchers tab
      fetchVouchers();


    } catch (err) {
      console.error(err);
      alert('Error issuing voucher');
    }
  };

  const handleBeneficiaryExcel = (file: File) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      const cleaned = rows.map((r) => ({
        name: String(r.Name || "").trim(),
        mobile: String(r.Mobile || "").trim(),
        email: String(r.Email || "").trim(),
        city: String(r.City || "").trim(),
        pincode: String(r.Pincode || "").trim(),
      }));

      setBeneficiaryUploadData(cleaned);

      // 🚀 Immediately upload using existing API logic
      for (const b of cleaned) {
        await fetch("/api/buyer/order/beneficiaries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: selectedOrder.orderId,
            sellerId: selectedOrder.sellerId,
            ...b,
          }),
        });
      }

      // Refresh list
      const updated = await fetch(
        `/api/buyer/order/beneficiaries?orderId=${selectedOrder.orderId}`
      );
      const dataUpdated = await updated.json();
      setOrderBeneficiaries(dataUpdated);

      alert("Beneficiaries uploaded successfully");
    };

    reader.readAsArrayBuffer(file);
  };
  return (
    <>
      <TopNav />
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="mb-10 flex items-center gap-4">
          <div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Buyers Dashboard
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Manage RFQs, Orders and Corporate Gifting Activities
            </p>
          </div>

        </div>
        <div className="p-6">
          {/* KPI ROW */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow p-6">
              <p className="text-sm text-gray-500">Active RFQs</p>
              <p className="text-2xl font-bold">{buyerRFQs.length}</p>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <p className="text-sm text-gray-500">Live Orders</p>
              <p className="text-2xl font-bold">{orders.length}</p>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <p className="text-sm text-gray-500">Vouchers Issued</p>
              <p className="text-2xl font-bold">
                {orderBeneficiaries.filter(b => b.voucherStatus === 'ISSUED').length}

              </p>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <p className="text-sm text-gray-500">RFQ Draft Items</p>
              <p className="text-2xl font-bold">{rfqItems.length}</p>
            </div>
          </div>

          <Tabs defaultValue="marketplace" className="mb-6">
            <TabsList className="border-b bg-transparent p-0 mb-6 flex gap-6">

              <TabsTrigger value="marketplace">OEMs Marketplace</TabsTrigger>
              <TabsTrigger value="create">Create RFQ (New)</TabsTrigger>
              <TabsTrigger value="bids">Bids / RFQs</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="beneficiaries">Beneficiaries</TabsTrigger>
              <TabsTrigger value="vouchers">Vouchers</TabsTrigger>

            </TabsList>
            {/* ────────────────────────────────────────────── */}
            {/*                MARKETPLACE TAB                  */}
            {/* ────────────────────────────────────────────── */}
            <TabsContent value="marketplace">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>OEMs Catalogues</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <select
                      className="border p-2 rounded"
                      value={filterCategory}
                      onChange={e => setFilterCategory(e.target.value)}
                    >
                      <option value="All">All Categories</option>
                      <option value="Scooter">Scooter</option>
                      <option value="Motorcycle">Motorcycle</option>
                    </select>

                    <select
                      className="border p-2 rounded"
                      value={filterFuel}
                      onChange={e => setFilterFuel(e.target.value)}
                    >
                      <option value="All">All Fuel Types</option>
                      <option value="EV">EV</option>
                      <option value="Petrol">ICE</option>
                    </select>

                    <select
                      className="border p-2 rounded"
                      value={filterOEM}
                      onChange={e => setFilterOEM(e.target.value)}
                    >
                      <option value="All">All OEMs</option>
                      {[...new Set(products.map(p => p.oem).filter(Boolean))]
                        .map((oem, index) => (
                          <option key={`${oem}-${index}`} value={oem}>
                            {oem}
                          </option>
                        ))}

                    </select>
                  </div>

                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        <th>OEM</th>
                        <th>Model</th>
                        <th>Category</th>
                        <th>Fuel</th>
                        <th>Indicative Price</th>
                        <th>MOQ</th>
                        <th>Compare</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center p-4 text-gray-400">
                            No catalogue items published yet
                          </td>
                        </tr>
                      ) : (
                        products.map(p => (
                          <tr key={p.id} className="border-t">
                            <td>{p.oemName}</td>
                            <td>{p.modelName}</td>
                            <td>{p.category || '—'}</td>
                            <td>{p.fuelType || '—'}</td>
                            <td>₹ {p.exShowroomPrice?.toLocaleString()}</td>
                            <td>{p.moq}</td>
                            <td className="text-center">
                              <input
                                type="checkbox"
                                checked={compareModels.some(m => m.id === p.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    if (compareModels.length >= 3) {
                                      alert("Maximum 3 models allowed for comparison");
                                      return;
                                    }

                                    const updated = [...compareModels, p];
                                    setCompareModels(updated);

                                    if (updated.length === 3) {
                                      setShowCompareModal(true);
                                    }
                                  } else {
                                    setCompareModels(prev =>
                                      prev.filter(m => m.id !== p.id)
                                    );
                                  }
                                }}
                              />
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>

                  </table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ────────────────────────────────────────────── */}
            {/*                 CREATE RFQ TAB                  */}
            {/* ────────────────────────────────────────────── */}
            <TabsContent value="create">
              <Card>
                <CardHeader>
                  <CardTitle>Create New RFQ</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 mb-4">
                    Start a new RFQ using model-specific or budget-based flow.
                  </p>

                  <div className="border rounded-lg p-4">
                    <div className="mb-6">
                      <p className="font-medium mb-2">RFQ Mode</p>
                      <div className="flex gap-6">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            checked={rfqMode === 'MODEL'}
                            onChange={() => setRfqMode('MODEL')}
                          />
                          Model-specific RFQ
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            checked={rfqMode === 'BUDGET'}
                            onChange={() => setRfqMode('BUDGET')}
                          />
                          Open RFQ (Budget-based)
                        </label>
                      </div>
                    </div>

                    {rfqMode === 'MODEL' && (
                      <div className="mb-6">
                        <h4 className="font-medium mb-3">Select Model(s) from Marketplace</h4>
                        <div className="border rounded-lg max-h-56 overflow-y-auto mb-6">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="p-2">Select</th>
                                <th className="p-2">OEM</th>
                                <th className="p-2">Model</th>
                                <th className="p-2">Category</th>
                                <th className="p-2">Fuel</th>
                              </tr>
                            </thead>
                            <tbody>
                              {products.map((p, idx) => (
                                <tr key={p.id || idx} className="border-t">
                                  <td className="p-2">
                                    <input
                                      type="checkbox"
                                      checked={rfqItems.some(i => i.catalogueId === p.id)}
                                      onChange={(e) => toggleRfqItem(p, e.target.checked)}
                                    />
                                  </td>

                                  <td className="p-2">{p.oemName}</td>
                                  <td className="p-2">{p.modelName}</td>
                                  <td className="p-2">{p.category}</td>
                                  <td className="p-2">{p.fuelType}</td>
                                </tr>
                              ))}
                            </tbody>

                          </table>
                        </div>

                        <h4 className="font-medium mb-4">Location-wise Quantity (Per Product)</h4>

                        {rfqItems.map((item, itemIndex) => (
                          <div key={item.catalogueId} className="border rounded-lg p-4 mb-4">

                            <h5 className="font-semibold mb-3">
                              {item.modelName}
                            </h5>

                            <table className="w-full text-sm mb-4">
                              <thead>
                                <tr>
                                  <th>City</th>
                                  <th>Quantity</th>
                                </tr>
                              </thead>
                              <tbody>
                                {item.locations.map((loc: any, locIndex: number) => (
                                  <tr key={locIndex} className="border-t">
                                    <td>
                                      <input
                                        className="border p-1 w-full"
                                        placeholder="City"
                                        value={loc.city}
                                        onChange={e => {
                                          const updated = [...rfqItems];
                                          updated[itemIndex].locations[locIndex].city = e.target.value;
                                          setRfqItems(updated);
                                        }}
                                      />
                                    </td>
                                    <td>
                                      <input
                                        className="border p-1 w-full"
                                        placeholder="Qty"
                                        type="number"
                                        value={loc.qty}
                                        onChange={e => {
                                          const updated = [...rfqItems];
                                          updated[itemIndex].locations[locIndex].qty = e.target.value;
                                          setRfqItems(updated);
                                        }}
                                      />
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            <Button
                              variant="outline"
                              onClick={() => {
                                const updated = [...rfqItems];
                                updated[itemIndex].locations.push({ city: '', qty: '' });
                                setRfqItems(updated);
                              }}
                            >
                              + Add Location
                            </Button>

                          </div>
                        ))}

                        <div className="flex items-center gap-4 mb-6">
                          <Button
                            variant="outline"
                            onClick={() => setLocationRows(prev => [...prev, { city: '', qty: '' }])}
                          >
                            + Add Row
                          </Button>
                          <span className="text-sm text-gray-500">or</span>
                          <div>
                            <label className="block text-sm font-medium mb-1">Upload via Excel</label>
                            <input type="file" accept=".xlsx,.xls" />
                            <p className="text-xs text-gray-500 mt-1">Columns: City, Quantity</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {rfqMode === 'BUDGET' && (
                      <div className="border rounded-lg p-4 space-y-4 mb-6">

                        <div className="grid md:grid-cols-2 gap-4">
                          <select
                            className="border p-2 rounded"
                            value={budgetForm.fuelType}
                            onChange={e => setBudgetForm({ ...budgetForm, fuelType: e.target.value })}
                          >
                            <option value="">Select Fuel Type</option>
                            <option value="ICE">ICE</option>
                            <option value="EV">EV</option>
                          </select>

                          <select
                            className="border p-2 rounded"
                            value={budgetForm.vehicleType}
                            onChange={e => setBudgetForm({ ...budgetForm, vehicleType: e.target.value })}
                          >
                            <option value="">Select Vehicle Type</option>
                            <option value="Motorcycle">Motorcycle</option>
                            <option value="Scooter">Scooter</option>
                          </select>
                        </div>

                        {budgetForm.fuelType === 'ICE' && (
                          <div className="grid md:grid-cols-2 gap-4">
                            <input
                              className="border p-2 rounded"
                              placeholder="Min Engine Capacity (CC)"
                              value={budgetForm.minSpec}
                              onChange={e => setBudgetForm({ ...budgetForm, minSpec: e.target.value })}
                            />
                            <input
                              className="border p-2 rounded"
                              placeholder="Max Engine Capacity (CC)"
                              value={budgetForm.maxSpec}
                              onChange={e => setBudgetForm({ ...budgetForm, maxSpec: e.target.value })}
                            />
                          </div>
                        )}

                        {budgetForm.fuelType === 'EV' && (
                          <div className="grid md:grid-cols-2 gap-4">
                            <input
                              className="border p-2 rounded"
                              placeholder="Min Motor Power (kW)"
                              value={budgetForm.minSpec}
                              onChange={e => setBudgetForm({ ...budgetForm, minSpec: e.target.value })}
                            />
                            <input
                              className="border p-2 rounded"
                              placeholder="Max Motor Power (kW)"
                              value={budgetForm.maxSpec}
                              onChange={e => setBudgetForm({ ...budgetForm, maxSpec: e.target.value })}
                            />
                          </div>
                        )}

                        <div className="grid md:grid-cols-2 gap-4">
                          <input
                            className="border p-2 rounded"
                            placeholder="Min Budget (₹)"
                            value={budgetForm.minBudget}
                            onChange={e => setBudgetForm({ ...budgetForm, minBudget: e.target.value })}
                          />
                          <input
                            className="border p-2 rounded"
                            placeholder="Max Budget (₹)"
                            value={budgetForm.maxBudget}
                            onChange={e => setBudgetForm({ ...budgetForm, maxBudget: e.target.value })}
                          />
                        </div>
                        <h4 className="font-medium mt-4 mb-2">Location-wise Quantity</h4>

                        <table className="w-full text-sm mb-4">
                          <thead>
                            <tr>
                              <th>City</th>
                              <th>Quantity</th>
                            </tr>
                          </thead>
                          <tbody>
                            {budgetForm.locations.map((loc, idx) => (
                              <tr key={idx} className="border-t">
                                <td>
                                  <input
                                    className="border p-1 w-full"
                                    placeholder="City"
                                    value={loc.city}
                                    onChange={e => {
                                      const updated = [...budgetForm.locations];
                                      updated[idx].city = e.target.value;
                                      setBudgetForm({ ...budgetForm, locations: updated });
                                    }}
                                  />
                                </td>
                                <td>
                                  <input
                                    type="number"
                                    className="border p-1 w-full"
                                    placeholder="Qty"
                                    value={loc.qty}
                                    onChange={e => {
                                      const updated = [...budgetForm.locations];
                                      updated[idx].qty = e.target.value;
                                      setBudgetForm({ ...budgetForm, locations: updated });
                                    }}
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        <Button
                          variant="outline"
                          onClick={() =>
                            setBudgetForm({
                              ...budgetForm,
                              locations: [...budgetForm.locations, { city: '', qty: '' }]
                            })
                          }
                        >
                          + Add Location
                        </Button>
                        <p className="mt-2 text-sm text-gray-600">
                          Total Quantity: <strong>{totalBudgetQty}</strong>
                        </p>

                      </div>
                    )}

                    <div className="flex justify-end">
                      <Button
                        className="bg-indigo-600 hover:bg-indigo-700"
                        onClick={submitRFQ}
                        disabled={
                          submitting ||
                          !rfqDraftActive ||
                          (
                            rfqMode === 'MODEL'
                              ? rfqItems.length === 0
                              : totalBudgetQty === 0
                          )
                        }
                      >
                        {submitting ? "Submitting..." : "Submit RFQ"}
                      </Button>
                      {/* 👇 POST-SUBMIT ACTION */}
                      {!rfqDraftActive && (
                        <Button
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => setRfqDraftActive(true)}
                        >
                          Create New RFQ
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ────────────────────────────────────────────── */}
            {/*                   BIDS TAB                     */}
            {/* ────────────────────────────────────────────── */}
            <TabsContent value="bids">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Bids / RFQs Tracker</CardTitle>
                </CardHeader>
                <CardContent>
                  <table className="w-full text-sm mb-6">
                    <thead>
                      <tr>
                        <th>RFQ ID</th>
                        <th>Type</th>
                        <th>Scope</th>
                        <th>Qty</th>
                        <th>Status</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {buyerRFQs.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center p-4 text-gray-400">
                            No RFQs created yet
                          </td>
                        </tr>
                      ) : (
                        buyerRFQs.map(r => (
                          <tr key={r.rfqId} className="border-t">
                            <td>{r.rfqId}</td>
                            <td>{r.rfqType}</td>
                            <td>
                              {r.rfqType === 'MODEL'
                                ? r.items?.map((i: any) => i.modelName).join(', ')
                                : `${r.items?.[0]?.fuelType} ${r.items?.[0]?.vehicleType} 
       (${r.items?.[0]?.minSpec}-${r.items?.[0]?.maxSpec})`
                              }
                            </td>
                            <td>
                              {r.items?.reduce((sum: number, i: any) => sum + Number(i.requestedQty || 0), 0) || 0}
                            </td>
                            <td>{r.status}</td>
                            <td>
                              <button
                                className="text-indigo-600 underline"
                                onClick={() => openBids(r)}
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ────────────────────────────────────────────── */}
            {/*                   ORDERS TAB                   */}
            {/* ────────────────────────────────────────────── */}
            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <CardTitle>Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <p className="text-gray-400 text-sm">No orders placed yet</p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>RFQ ID</th>
                          <th>Seller</th>
                          <th>Models</th>
                          <th>Order Value</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map(o => (
                          <tr key={o.orderId} className="border-t">
                            <td>{o.orderId}</td>
                            <td>{o.rfqId}</td>
                            <td>{o.sellerName}</td>
                            <td>{o.items?.map((i: any) => i.modelName).join(', ') || '—'}</td>
                            <td>₹{o.orderValue}</td>
                            <td className="text-green-600 font-medium">{o.status}</td>
                            <td>
                              {o.status === 'PLACED' ? (
                                <button
                                  className="px-3 py-1 bg-indigo-600 text-white rounded text-sm"
                                  onClick={() => {
                                    setSelectedOrder(o);
                                    setShowVoucherModal(true);
                                  }}
                                >
                                  Upload Beneficiaries
                                </button>

                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="beneficiaries">
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
                        <th>Reseller Name</th>
                        <th>Reseller Code</th>
                        <th>Voucher Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderBeneficiaries.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center text-gray-400 p-4">
                            No beneficiaries mapped yet
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
                            <td>{b.reseller?.companyName || '—'}</td>
                            <td>{b.reseller?.resellerCode || 'Not Available'}</td>

                            <td className="font-medium text-yellow-600">
                              {b.voucherStatus}
                            </td>

                            <td>
                              {b.voucherStatus === 'MAPPED' ? (
                                <button
                                  className="px-2 py-1 bg-green-600 text-white rounded text-xs"
                                  onClick={() => issueSingleVoucher(b)}
                                >
                                  Issue
                                </button>
                              ) : b.voucherStatus === 'ISSUED' ? (
                                <span className="text-gray-500 text-xs">Already Issued</span>
                              ) : (
                                <span className="text-red-500 text-xs">Not Eligible</span>
                              )}
                            </td>

                          </tr>
                        ))

                      )}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </TabsContent>



            {/* ────────────────────────────────────────────── */}
            {/*                  VOUCHERS TAB                  */}
            {/* ────────────────────────────────────────────── */}
            <TabsContent value="vouchers">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Vouchers Tracker</CardTitle>
                </CardHeader>
                <CardContent>
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        <th>Voucher ID</th>
                        <th>Order ID</th>
                        <th>Beneficiary</th>
                        <th>Mobile</th>
                        <th>OEM</th>
                        <th>Model</th>
                        <th>Status</th>
                        <th>Issued On</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vouchers.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center p-4 text-gray-400">
                            No vouchers issued yet
                          </td>
                        </tr>
                      ) : (
                        vouchers.map((v) => (
                          <tr key={v.voucherId} className="border-t">
                            <td>
                              <button
                                className="text-indigo-600 underline"
                                onClick={() => {
                                  setSelectedVoucher(v);
                                  setShowVoucherDetail(true);
                                }}
                              >
                                {v.voucherId}
                              </button>
                            </td>

                            <td>{v.orderId}</td>
                            <td>{v.beneficiary?.name}</td>
                            <td>{v.beneficiary?.mobile}</td>
                            <td>{v.reseller?.oemName || '—'}</td>
                            <td>{v.reseller?.companyName || 'Not Assigned'}</td>

                            <td className="text-green-600 font-medium">
                              {v.status}
                            </td>

                            <td>
                              {new Date(v.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>

                  </table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* ────────────────────────────────────────────── */}
          {/*               MODALS (all of them)              */}
          {/* ────────────────────────────────────────────── */}
          {showCompareModal && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white w-full max-w-6xl rounded-xl p-6 max-h-[90vh] overflow-y-auto">

                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Model Comparison</h2>
                  <button
                    className="text-gray-500 text-xl"
                    onClick={() => setShowCompareModal(false)}
                  >
                    ✕
                  </button>
                </div>

                <table className="w-full text-sm border">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-3 text-left">Specification</th>
                      {compareModels.map(m => (
                        <th key={m.id} className="p-3 text-center">
                          {m.modelName}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    <tr className="border-t">
                      <td className="p-2 font-medium">OEM</td>
                      {compareModels.map(m => (
                        <td key={m.id} className="p-2 text-center">
                          {m.oemName}
                        </td>
                      ))}
                    </tr>

                    <tr className="border-t">
                      <td className="p-2 font-medium">Fuel Type</td>
                      {compareModels.map(m => (
                        <td key={m.id} className="p-2 text-center">
                          {m.fuelType}
                        </td>
                      ))}
                    </tr>

                    <tr className="border-t">
                      <td className="p-2 font-medium">Engine Capacity</td>
                      {compareModels.map(m => (
                        <td key={m.id} className="p-2 text-center">
                          {m.engineCapacity || "—"}
                        </td>
                      ))}
                    </tr>

                    <tr className="border-t">
                      <td className="p-2 font-medium">Indicative Price</td>
                      {compareModels.map(m => (
                        <td key={m.id} className="p-2 text-center">
                          ₹{m.exShowroomPrice?.toLocaleString()}
                        </td>
                      ))}
                    </tr>

                    <tr className="border-t">
                      <td className="p-2 font-medium">MOQ</td>
                      {compareModels.map(m => (
                        <td key={m.id} className="p-2 text-center">
                          {m.moq}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>

              </div>
            </div>
          )}
          {/* Order Summary Modal */}
          {showOrderSummary && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-xl w-full max-w-3xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-lg">Order & Payment Summary</h3>
                  <Button variant="outline" onClick={() => setShowOrderSummary(false)}>
                    Close
                  </Button>
                </div>
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <p><strong>RFQ ID:</strong> RFQ-001</p>
                  <p><strong>OEM:</strong> TVS</p>
                  <p><strong>Model:</strong> iQube</p>
                  <p><strong>Quantity:</strong> 280</p>
                  <p><strong>Unit Price:</strong> ₹1.05L</p>
                  <p><strong>Total Value:</strong> ₹2.94 Cr</p>
                  <p><strong>Delivery:</strong> 30 days</p>
                </div>
                <div className="flex justify-end">
                  <Button className="bg-indigo-600" onClick={() => setShowOrderSummary(false)}>
                    Make Payment to OEM
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Issue Vouchers Modal */}
          {showVoucherModal && selectedOrder && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center px-6 py-4 bg-indigo-600 text-white rounded-t-xl">
                  <h3 className="font-semibold text-lg">Issue Vouchers</h3>
                  <button
                    className="text-white hover:text-gray-200 text-2xl leading-none"
                    onClick={() => setShowVoucherModal(false)}
                  >
                    ×
                  </button>
                </div>

                <div className="p-6">
                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div className="border rounded-lg p-5">
                      <h4 className="font-medium mb-3">Upload Beneficiaries via Excel</h4>
                      <input
                        type="file"
                        accept=".xlsx,.xls"
                        className="mb-2 block w-full"
                        onChange={(e) =>
                          e.target.files && handleBeneficiaryExcel(e.target.files[0])
                        }
                      />
                      <p className="text-xs text-gray-500">
                        Columns: Name, Mobile, Email, City, Pincode
                      </p>
                    </div>

                    <div className="border rounded-lg p-5">
                      <h4 className="font-medium mb-3">Add Beneficiary Manually</h4>
                      <div className="grid gap-3">
                        <input
                          className="border p-2 rounded w-full"
                          placeholder="Name"
                          value={beneficiaryForm.name}
                          onChange={e => setBeneficiaryForm({ ...beneficiaryForm, name: e.target.value })}
                        />
                        <input
                          className="border p-2 rounded w-full"
                          placeholder="Mobile"
                          value={beneficiaryForm.mobile}
                          onChange={e => setBeneficiaryForm({ ...beneficiaryForm, mobile: e.target.value })}
                        />
                        <input
                          className="border p-2 rounded w-full"
                          placeholder="Email"
                          value={beneficiaryForm.email}
                          onChange={e => setBeneficiaryForm({ ...beneficiaryForm, email: e.target.value })}
                        />
                        <input
                          className="border p-2 rounded w-full"
                          placeholder="City"
                          value={beneficiaryForm.city}
                          onChange={e => setBeneficiaryForm({ ...beneficiaryForm, city: e.target.value })}
                        />
                        <input
                          className="border p-2 rounded w-full"
                          placeholder="Pincode"
                          value={beneficiaryForm.pincode}
                          onChange={e => setBeneficiaryForm({ ...beneficiaryForm, pincode: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setShowVoucherModal(false)}>
                      Cancel
                    </Button>
                    <Button
                      className="bg-indigo-600 hover:bg-indigo-700"
                      onClick={submitBeneficiary}
                      disabled={!beneficiaryForm.name || !beneficiaryForm.mobile}
                    >
                      Add Beneficiary
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Beneficiary Upload Modal (separate / legacy?) */}
          {showBeneficiaryUpload && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-lg">Beneficiary Details</h3>
                  <Button variant="outline" onClick={() => setShowBeneficiaryUpload(false)}>
                    Close
                  </Button>
                </div>
                {/* same content as above – consider merging if not needed separately */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Upload Beneficiaries via Excel</h4>
                    <input type="file" accept=".xlsx,.xls" className="mb-2 w-full" />
                    <p className="text-xs text-gray-500">Columns: Name, Mobile, Email, City, Pincode</p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Add Beneficiary Manually</h4>
                    <div className="grid gap-2">
                      <input className="border p-2 rounded w-full" placeholder="Name" value={beneficiaryForm.name} onChange={e => setBeneficiaryForm({ ...beneficiaryForm, name: e.target.value })} />
                      <input className="border p-2 rounded w-full" placeholder="Mobile" value={beneficiaryForm.mobile} onChange={e => setBeneficiaryForm({ ...beneficiaryForm, mobile: e.target.value })} />
                      {/* ... other fields ... */}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setShowBeneficiaryUpload(false)}>
                    Cancel
                  </Button>
                  <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={submitBeneficiary}>
                    Add Beneficiary
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Bid Modal */}
          {showBidModal && selectedRfq && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white w-full max-w-4xl rounded-xl p-6 max-h-[90vh] overflow-y-auto">
                <h2 className="text-lg font-semibold mb-4">
                  Bids for RFQ – {selectedRfq.rfqId}
                </h2>
                <table className="w-full text-sm border">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="p-2 text-left">Seller</th>
                      <th className="p-2">Price</th>
                      <th className="p-2">MOQ</th>
                      <th className="p-2">Delivery</th>
                      <th className="p-2">Validity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bids.map(b => {
                      const isL1 = b.quotedUnitPrice === lowestPrice;
                      return (
                        <tr
                          key={b.bidId}
                          className={`border-t ${b.bidId === l1BidId ? 'bg-green-50 border-l-4 border-green-600' : ''}`}
                        >
                          <td className="p-2 text-right">
                            {b.bidId === l1BidId && (
                              <button
                                className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
                                onClick={() => handleSelectL1(b)}
                              >
                                Select L1
                              </button>
                            )}
                          </td>
                          <td className="p-2">{b.sellerName}</td>
                          <td className="p-2">₹{b.quotedUnitPrice}</td>
                          <td className="p-2">{b.moq}</td>
                          <td className="p-2">{b.deliveryTimeline}</td>
                          <td className="p-2">{b.validityDays} days</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div className="flex justify-end mt-4">
                  <Button variant="outline" onClick={() => setShowBidModal(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Voucher Detail Modal */}
          {showVoucherDetail && selectedVoucher && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-xl w-full max-w-xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-lg">Voucher Details</h3>
                  <Button variant="outline" onClick={() => setShowVoucherDetail(false)}>
                    Close
                  </Button>
                </div>
                <div className="grid gap-2 text-sm">
                  <p><strong>Voucher ID:</strong> {selectedVoucher.voucherId}</p>
                  <p><strong>Order ID:</strong> {selectedVoucher.orderId}</p>
                  <p><strong>Beneficiary:</strong> {selectedVoucher.beneficiary?.name}</p>
                  <p><strong>OEM:</strong> {selectedVoucher.reseller?.oemName}</p>
                  <p><strong>Dealer:</strong> {selectedVoucher.reseller?.companyName}</p>
                  <p><strong>Status:</strong> {selectedVoucher.status}</p>

                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}