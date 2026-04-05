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
  const [orderBeneficiaries, setOrderBeneficiaries] = useState<any[]>([])
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentModal, setPaymentModal] = useState<any | null>(null)
  const [paymentForm, setPaymentForm] = useState({
    utr: "",
    amount: "",
    date: ""
  })
  const [utr, setUtr] = useState("")
  const [date, setDate] = useState("")
  // 🔥 AFTER declaration
  const filteredBeneficiaries = selectedOrder
    ? orderBeneficiaries.filter(b => b.orderId === selectedOrder.orderId)
    : []

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
    loadBeneficiaries();
  }, []);
  useEffect(() => {
    fetchVouchers();
  }, []);
  const downloadTemplate = async () => {
    if (!selectedOrder) return;

    const res = await fetch(
      `/api/beneficiary/template?orderId=${selectedOrder.orderId}`
    );

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "beneficiaries.xlsx";
    a.click();
  };
  const loadBeneficiaries = async () => {
    try {
      const res = await fetch(`/api/buyer/order/beneficiaries?buyerId=BUYER_001`);
      const data = await res.json();

      setOrderBeneficiaries(data);
    } catch (err) {
      console.error("Failed to load beneficiaries", err);
    }
  };
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!selectedOrder) {
        alert("No order selected");
        return;
      }
      const file = e.target.files?.[0];
      if (!file) {
        alert("No file selected");
        return;
      }
      const formData = new FormData();
      formData.append("file", file);
      formData.append("orderId", selectedOrder.orderId);
      const res = await fetch("/api/buyer/order/beneficiaries", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Upload failed");
        return;
      }
      alert(`Uploaded: ${data.success}, Failed: ${data.failed}`);
      // ✅ TEMP REFRESH
      alert(`Uploaded: ${data.success}, Failed: ${data.failed}`);
      console.log("UPLOAD RESULT:", data);
      await loadBeneficiaries();
    } catch (err) {
      console.error(err);
      alert("Upload crashed");
    }
  };
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
    const loadBeneficiaries = async () => {
      try {
        const res = await fetch(`/api/buyer/order/beneficiaries?buyerId=BUYER_001`);
        const text = await res.text();
        if (!res.ok) {
          console.error("API FAILED RAW:", text);
          let parsed;
          try {
            parsed = JSON.parse(text);
          } catch {
            parsed = text;
          }
          console.error("API FAILED PARSED:", parsed);
          setOrderBeneficiaries([]);   // ✅ prevent crash
          return;
        }
        const data = text ? JSON.parse(text) : [];
        setOrderBeneficiaries(data);
      } catch (err) {
        console.error("Beneficiary fetch error:", err);
        setOrderBeneficiaries([]);   // ✅ fallback
      }
    };
    loadBeneficiaries();
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
      console.log("RFQ opened:", rfq.rfqId);
      console.log("Bids received:", data);
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
  const downloadQuotation = async (rfqId: string) => {
    const res = await fetch(
      `/api/documents/quotations/pdf?rfqId=${rfqId}`
    )
    if (!res.ok) {
      alert("Download failed")
      return
    }
    const blob = await res.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `quotation-${rfqId}.pdf`
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
  }
  const downloadProforma = async (rfqId: string) => {
    try {
      // 🔥 Step 1: get order using RFQ
      const resOrder = await fetch(`/api/seller/order/list?rfqId=${rfqId}`)
      const orders = await resOrder.json()
      if (!orders.length) {
        alert("Order not created yet")
        return
      }
      const orderId = orders[0].orderId
      // 🔥 Step 2: download proforma using orderId
      const res = await fetch(`/api/documents/proforma/pdf?orderId=${orderId}`)
      if (!res.ok) {
        alert("Proforma not available")
        return
      }
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `Proforma-${orderId}.pdf`
      a.click()
    } catch (err) {
      console.error(err)
      alert("Proforma download failed")
    }
  }
  const downloadPO = async (orderId: string) => {
    try {
      const res = await fetch(`/api/documents/po/pdf?orderId=${orderId}`)
      if (!res.ok) {
        alert("PO not available yet")
        return
      }
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `PO-${orderId}.pdf`
      a.click()
    } catch (err) {
      console.error("PO download error:", err)
      alert("Error downloading PO")
    }
  }
  const downloadReceipt = async (orderId: string) => {
    const res = await fetch(`/api/documents/receipt/pdf?orderId=${orderId}`)
    if (!res.ok) {
      alert("Receipt not available")
      return
    }
    const blob = await res.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `receipt-${orderId}.pdf`
    a.click()
  }
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
  const lowestPrice = useMemo(() => {
    const prices: number[] = [];
    bids.forEach((b: any) => {
      (b.locationQuotes || []).forEach((model: any) => {

        (model.locations || []).forEach((loc: any) => {

          const price = Number(loc.quotedPrice);

          if (price > 0) {
            prices.push(price);
          }
        });
      });
    });
    return prices.length ? Math.min(...prices) : null;
  }, [bids]);
  const l1BidId = useMemo(() => {
    if (!bids?.length) return null;
    return bids.reduce((minBid: any, currentBid: any) => {
      const minValue = Number(minBid.totalValue || Infinity);
      const currentValue = Number(currentBid.totalValue || Infinity);
      return currentValue < minValue ? currentBid : minBid;
    }).bidId;
  }, [bids]);
  const handleSelectL1 = async (bid: any, rfq: any) => {
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
          items: rfq.items
        }),
      });
      if (res.ok) {
        alert('Order placed successfully');
        // refresh orders
        const updated = await fetch('/api/buyer/order/list?buyerId=BUYER_001')
        const data = await updated.json()
        setOrders(data)
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
  const downloadRFQ = (rfq: any) => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(rfq, null, 2));
    const link = document.createElement("a");
    link.href = dataStr;
    link.download = rfq.rfqId + ".json";
    link.click();
  };
  const sendRFQ = (rfq: any) => {
    alert("RFQ sent to sellers");
  };
  const placeOrder = (rfq: any) => {
    const order = {
      orderId: "ORD-" + Date.now(),
      rfqId: rfq.rfqId,
      items: rfq.items,
      qty: rfq.items?.reduce(
        (sum: number, i: any) =>
          sum + (i.locations || []).reduce(
            (s: number, l: any) => s + Number(l.qty || 0),
            0
          ),
        0
      ),
      date: new Date().toISOString(),
      status: "PLACED"
    };
    console.log("Order Created", order);
    // update RFQ status
    rfq.status = "ORDERED";
    // go to confirmation page
    window.location.href = "/order";
  };
  const [file, setFile] = useState<File | null>(null);
  const uploadFile = async () => {
    if (!file) return alert("Select file");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("orderId", selectedOrder.orderId); // ✅ IMPORTANT
    const res = await fetch("/api/buyer/order/beneficiary", {
      method: "POST",
      body: formData
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Upload failed");
      return;
    }
    alert(`Uploaded: ${data.success}, Failed: ${data.failed}`);
  };


  return (
    <>
      <TopNav />
      <div className="min-h-screen bg-gray-100 py-6">
        <div className="px-6 space-y-6">
          <div className="bg-gray-50 border rounded-2xl p-6 shadow-sm">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
              Buyers Dashboard
            </h1>
            <p className="text-sm mt-2 text-gray-500">
              Manage RFQs, Orders and Corporate Gifting Activities
            </p>
          </div>
        </div>
        <div className="p-6">

          {/* KPI ROW */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">

            <div className="rounded-2xl p-6 border shadow-sm bg-blue-50">
              <p className="text-sm text-gray-600">Active RFQs</p>
              <h2 className="text-xl font-bold mt-1">23</h2>
            </div>

            <div className="rounded-2xl p-6 border shadow-sm bg-green-50">
              <p className="text-sm text-gray-600">Live Orders</p>
              <h2 className="text-xl font-bold mt-1">30</h2>
            </div>

            <div className="rounded-2xl p-6 border shadow-sm bg-purple-50">
              <p className="text-sm text-gray-600">Vouchers Issued</p>
              <h2 className="text-xl font-bold mt-1">66</h2>
            </div>

            <div className="rounded-2xl p-6 border shadow-sm bg-yellow-50">
              <p className="text-sm text-gray-600">RFQ Draft Items</p>
              <h2 className="text-xl font-bold mt-1">0</h2>
            </div>

          </div>
          <Tabs defaultValue="marketplace" className="mb-6">
            <TabsList className="bg-gray-100 rounded-xl p-1 inline-flex gap-2">
              <TabsTrigger
                value="marketplace"
                className="px-4 py-2 rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
              >
                OEMs Marketplace
              </TabsTrigger>
              <TabsTrigger value="create" className="px-4 py-2 rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
              > Create RFQ (New)</TabsTrigger>
              <TabsTrigger value="bids" className="px-4 py-2 rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
              >Bids / RFQs</TabsTrigger>
              <TabsTrigger value="orders" className="px-4 py-2 rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
              >Orders</TabsTrigger>
              <TabsTrigger value="beneficiaries" className="px-4 py-2 rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
              >Beneficiaries</TabsTrigger>
              <TabsTrigger value="vouchers" className="px-4 py-2 rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
              >Vouchers</TabsTrigger>
            </TabsList>


            {/* ────────────────────────────────────────────── */}
            {/*                MARKETPLACE TAB                  */}
            {/* ────────────────────────────────────────────── */}
            <TabsContent value="marketplace">

              {/* ✅ HEADER OUTSIDE CARD */}

              <div className="bg-white p-4 rounded-2xl border shadow-sm flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800">
                  OEMs Catalogue
                </h3>
                <p className="text-sm text-gray-500 mt-4">
                  Browse and select models for RFQ creation
                </p>
              </div>
              <Card className="mb-6 bg-gray-50 border rounded-2xl shadow-sm">
                <CardContent>
                  <div className="space-y-5">
                    {/* ✅ FILTERS */}
                    <div className="grid md:grid-cols-3 gap-4">
                      <select
                        className="border border-gray-300 bg-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={filterCategory}
                        onChange={e => setFilterCategory(e.target.value)}
                      >
                        <option value="All">All Categories</option>
                        <option value="Scooter">Scooter</option>
                        <option value="Motorcycle">Motorcycle</option>
                      </select>

                      <select
                        className="border border-gray-300 bg-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={filterFuel}
                        onChange={e => setFilterFuel(e.target.value)}
                      >
                        <option value="All">All Fuel Types</option>
                        <option value="EV">EV</option>
                        <option value="Petrol">ICE</option>
                      </select>

                      <select
                        className="border border-gray-300 bg-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

                    {/* ✅ TABLE */}
                    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                      <table className="w-full text-sm">

                        <thead className="bg-gray-100 text-gray-700">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase">OEM</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Model</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Category</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Fuel</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Indicative Price</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase">MOQ</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-center">Compare</th>
                          </tr>
                        </thead>

                        <tbody>
                          {products.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="text-center py-10 text-gray-400">
                                No catalogue items published yet
                              </td>
                            </tr>
                          ) : (
                            products.map(p => (
                              <tr key={p.id} className="border-t border-gray-200 hover:bg-gray-50 transition">
                                <td className="px-4 py-3">{p.oemName}</td>
                                <td className="px-4 py-3">{p.modelName}</td>
                                <td className="px-4 py-3">{p.category || '—'}</td>
                                <td className="px-4 py-3">{p.fuelType || '—'}</td>
                                <td className="px-4 py-3">₹ {p.exShowroomPrice?.toLocaleString()}</td>
                                <td className="px-4 py-3">{p.moq}</td>
                                <td className="text-center">
                                  <input
                                    type="checkbox"
                                    className="w-4 h-4 accent-indigo-600 cursor-pointer"
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
                    </div>

                  </div>
                </CardContent>

              </Card>

            </TabsContent>
            {/* ────────────────────────────────────────────── */}
            {/*                 CREATE RFQ TAB                  */}
            {/* ────────────────────────────────────────────── */}

            <TabsContent value="create">
              {/* 🔥 HEADER */}
              <div className="bg-white p-4 rounded-2xl border shadow-sm flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800">
                  Create New RFQ
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Start a new RFQ using model-specific or budget-based flow.
                </p>
              </div>
              <Card className="mb-6 bg-gray-50 border rounded-2xl shadow-sm">
                <CardContent>
                  <div className="space-y-6">
                    {/* 🔥 MAIN BOX */}
                    <div className="bg-white border rounded-xl p-5 space-y-6">

                      {/* RFQ MODE */}
                      <div>
                        <p className="font-medium mb-3">RFQ Mode</p>
                        <div className="flex gap-6">
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="radio"
                              className="accent-indigo-600"
                              checked={rfqMode === 'MODEL'}
                              onChange={() => setRfqMode('MODEL')}
                            />
                            Model-specific RFQ
                          </label>

                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="radio"
                              className="accent-indigo-600"
                              checked={rfqMode === 'BUDGET'}
                              onChange={() => setRfqMode('BUDGET')}
                            />
                            Open RFQ (Budget-based)
                          </label>
                        </div>
                      </div>

                      {/* ================= MODEL MODE ================= */}
                      {rfqMode === 'MODEL' && (
                        <div className="space-y-6">

                          {/* TABLE */}
                          <div>
                            <h4 className="font-medium mb-3">
                              Select Model(s) from Marketplace
                            </h4>

                            <div className="overflow-x-auto rounded-xl border border-gray-200">
                              <table className="w-full text-sm">

                                <thead className="bg-gray-100 text-gray-700">
                                  <tr>
                                    <th className="px-4 py-3">Select</th>
                                    <th className="px-4 py-3 text-left">OEM</th>
                                    <th className="px-4 py-3 text-left">Model</th>
                                    <th className="px-4 py-3 text-left">Category</th>
                                    <th className="px-4 py-3 text-left">Fuel</th>
                                  </tr>
                                </thead>

                                <tbody>
                                  {products.map((p, idx) => (
                                    <tr key={p.id || idx} className="border-t border-gray-200 hover:bg-gray-50">

                                      <td className="px-4 py-3 text-center">
                                        <input
                                          type="checkbox"
                                          className="w-4 h-4 accent-indigo-600"
                                          checked={rfqItems.some(i => i.catalogueId === p.id)}
                                          onChange={(e) => toggleRfqItem(p, e.target.checked)}
                                        />
                                      </td>

                                      <td className="px-4 py-3">{p.oemName}</td>
                                      <td className="px-4 py-3">{p.modelName}</td>
                                      <td className="px-4 py-3">{p.category}</td>
                                      <td className="px-4 py-3">{p.fuelType}</td>

                                    </tr>
                                  ))}
                                </tbody>

                              </table>
                            </div>
                          </div>

                          {/* LOCATION WISE */}
                          <div>
                            <h4 className="font-medium mb-4">
                              Location-wise Quantity (Per Product)
                            </h4>

                            {rfqItems.map((item, itemIndex) => (
                              <div key={item.catalogueId} className="bg-gray-50 border rounded-xl p-4 space-y-4">

                                <h5 className="font-semibold">{item.modelName}</h5>

                                <table className="w-full text-sm">
                                  <thead className="text-gray-600">
                                    <tr>
                                      <th className="text-left py-2">City</th>
                                      <th className="text-left py-2">Quantity</th>
                                    </tr>
                                  </thead>

                                  <tbody>
                                    {item.locations.map((loc: any, locIndex: number) => (
                                      <tr key={locIndex} className="border-t">

                                        <td className="py-2">
                                          <input
                                            className="border border-gray-300 rounded px-2 py-1 w-full"
                                            placeholder="City"
                                            value={loc.city}
                                            onChange={e => {
                                              const updated = [...rfqItems];
                                              updated[itemIndex].locations[locIndex].city = e.target.value;
                                              setRfqItems(updated);
                                            }}
                                          />
                                        </td>

                                        <td className="py-2">
                                          <input
                                            className="border border-gray-300 rounded px-2 py-1 w-full"
                                            type="number"
                                            placeholder="Qty"
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

                          </div>

                        </div>
                      )}

                      {/* ================= BUDGET MODE ================= */}
                      {rfqMode === 'BUDGET' && (
                        <div className="bg-gray-50 border rounded-xl p-4 space-y-4">

                          <div className="grid md:grid-cols-2 gap-4">
                            <select
                              className="border border-gray-300 px-3 py-2 rounded-lg"
                              value={budgetForm.fuelType}
                              onChange={e => setBudgetForm({ ...budgetForm, fuelType: e.target.value })}
                            >
                              <option value="">Select Fuel Type</option>
                              <option value="ICE">ICE</option>
                              <option value="EV">EV</option>
                            </select>

                            <select
                              className="border border-gray-300 px-3 py-2 rounded-lg"
                              value={budgetForm.vehicleType}
                              onChange={e => setBudgetForm({ ...budgetForm, vehicleType: e.target.value })}
                            >
                              <option value="">Select Vehicle Type</option>
                              <option value="Motorcycle">Motorcycle</option>
                              <option value="Scooter">Scooter</option>
                            </select>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4">
                            <input
                              className="border border-gray-300 px-3 py-2 rounded-lg"
                              placeholder="Min Budget (₹)"
                              value={budgetForm.minBudget}
                              onChange={e => setBudgetForm({ ...budgetForm, minBudget: e.target.value })}
                            />
                            <input
                              className="border border-gray-300 px-3 py-2 rounded-lg"
                              placeholder="Max Budget (₹)"
                              value={budgetForm.maxBudget}
                              onChange={e => setBudgetForm({ ...budgetForm, maxBudget: e.target.value })}
                            />
                          </div>

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

                          <p className="text-sm text-gray-600">
                            Total Quantity: <strong>{totalBudgetQty}</strong>
                          </p>

                        </div>
                      )}

                      {/* 🔥 ACTIONS */}
                      <div className="flex justify-end gap-3">

                        <Button
                          className="bg-indigo-600 hover:bg-indigo-700 text-white"
                          onClick={submitRFQ}
                          disabled={
                            submitting ||
                            !rfqDraftActive ||
                            (rfqMode === 'MODEL'
                              ? rfqItems.length === 0
                              : totalBudgetQty === 0)
                          }
                        >
                          {submitting ? "Submitting..." : "Submit RFQ"}
                        </Button>

                        {!rfqDraftActive && (
                          <Button
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => setRfqDraftActive(true)}
                          >
                            Create New RFQ
                          </Button>
                        )}

                      </div>

                    </div>

                  </div>
                </CardContent>

              </Card>

            </TabsContent>
            {/* ────────────────────────────────────────────── */}
            {/*                   BIDS TAB                     */}
            {/* ────────────────────────────────────────────── */}
            <TabsContent value="bids">
              {/* HEADER */}

              <div className="bg-white p-4 rounded-2xl border shadow-sm flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800">
                  Bids / RFQs Tracker
                </h3>
                <p className="text-sm text-gray-500">
                  Track RFQs, quotations and order actions
                </p>
              </div>

              <Card className="mb-6 bg-gray-50 border rounded-2xl shadow-sm">




                <CardContent>

                  {/* TABLE WRAPPER */}
                  <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">

                    <table className="w-full text-sm">

                      {/* HEADER */}
                      <thead className="bg-gray-100 text-gray-700">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase">RFQ ID</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Type</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Scope</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Qty</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Action</th>
                        </tr>
                      </thead>

                      {/* BODY */}
                      <tbody>
                        {buyerRFQs.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="text-center p-6 text-gray-400">
                              No RFQs created yet
                            </td>
                          </tr>
                        ) : (
                          buyerRFQs.map((r) => (
                            <tr
                              key={r.rfqId}
                              className="border-t border-gray-200 hover:bg-gray-50 transition"
                            >

                              {/* RFQ ID */}
                              <td className="px-4 py-3 font-medium text-indigo-600">
                                {r.rfqId}
                              </td>

                              {/* TYPE */}
                              <td className="px-4 py-3">
                                {r.rfqType}
                              </td>

                              {/* SCOPE */}
                              <td className="px-4 py-3">
                                {r.rfqType === 'MODEL'
                                  ? r.items?.map((i: any) => i.modelName).join(', ')
                                  : `${r.items?.[0]?.fuelType} ${r.items?.[0]?.vehicleType} 
                      (${r.items?.[0]?.minSpec}-${r.items?.[0]?.maxSpec})`
                                }
                              </td>

                              {/* QTY */}
                              <td className="px-4 py-3">
                                {
                                  r.items?.reduce(
                                    (sum: number, i: any) =>
                                      sum +
                                      (i.locations || []).reduce(
                                        (s: number, l: any) => s + Number(l.qty || 0),
                                        0
                                      ),
                                    0
                                  ) || 0
                                }
                              </td>

                              {/* STATUS */}
                              <td className="px-4 py-3">
                                <span
                                  className={`px-2 py-1 text-xs rounded-full font-medium
                        ${r.status === 'OPEN' ? 'bg-yellow-100 text-yellow-700' : ''}
                        ${r.status === 'RESPONDED' ? 'bg-blue-100 text-blue-700' : ''}
                        ${r.status === 'CLOSED' ? 'bg-green-100 text-green-700' : ''}
                      `}
                                >
                                  {r.status}
                                </span>
                              </td>

                              {/* ACTIONS */}
                              <td className="px-4 py-3">
                                <div className="flex flex-wrap gap-2">

                                  <button
                                    className="bg-indigo-600 text-white px-3 py-1 rounded text-xs hover:bg-indigo-700 transition"
                                    onClick={() => openBids(r)}
                                  >
                                    View
                                  </button>

                                  <button
                                    className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition"
                                    onClick={() => downloadQuotation(r.rfqId)}
                                  >
                                    Download
                                  </button>

                                  <button
                                    className="bg-indigo-500 text-white px-3 py-1 rounded text-xs hover:bg-indigo-600 transition"
                                    onClick={() => downloadProforma(r.rfqId)}
                                  >
                                    Proforma
                                  </button>

                                  <button
                                    className="bg-purple-600 text-white px-3 py-1 rounded text-xs hover:bg-purple-700 transition"
                                    onClick={async () => {
                                      try {
                                        const res = await fetch(`/api/buyer/bid/list?rfqId=${r.rfqId}`)
                                        const data = await res.json()
                                        if (!data || data.length === 0) {
                                          alert("No bids received yet")
                                          return
                                        }

                                        const l1Bid = data.reduce((min: any, current: any) =>
                                          Number(current.totalValue) < Number(min.totalValue)
                                            ? current
                                            : min
                                        )

                                        const orderRes = await fetch("/api/order/create", {
                                          method: "POST",
                                          headers: { "Content-Type": "application/json" },
                                          body: JSON.stringify({
                                            rfqId: r.rfqId,
                                            buyerId: "BUYER_001"
                                          })
                                        })

                                        if (!orderRes.ok) {
                                          alert("Failed to create order")
                                          return
                                        }

                                        alert(`Order placed with ${l1Bid.sellerName}`)
                                        window.location.reload()

                                      } catch (err) {
                                        console.error("Order error:", err)
                                        alert("Something went wrong")
                                      }
                                    }}
                                  >
                                    Place Order
                                  </button>

                                </div>
                              </td>

                            </tr>
                          ))
                        )}
                      </tbody>

                    </table>
                  </div>

                </CardContent>
              </Card>
            </TabsContent>
            {/* ────────────────────────────────────────────── */}
            {/*                   ORDERS TAB                   */}
            {/* ────────────────────────────────────────────── */}
            <TabsContent value="orders">

              {/* HEADER (same as your Bids tab) */}
              <div className="bg-white p-4 rounded-2xl border shadow-sm flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800">
                  Orders
                </h3>
                <p className="text-sm text-gray-500">
                  Manage orders, payments and beneficiaries
                </p>
              </div>

              <Card className="mb-6 bg-gray-50 border rounded-2xl shadow-sm">

                <CardContent>

                  {orders.length === 0 ? (
                    <p className="text-gray-400 text-sm px-4 py-6">
                      No orders placed yet
                    </p>
                  ) : (

                    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">

                      <table className="w-full text-sm">

                        {/* HEADER */}
                        <thead className="bg-gray-100 text-gray-700">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Order ID</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase">RFQ ID</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Seller</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Models</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Order Value</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Action</th>
                          </tr>
                        </thead>

                        {/* BODY */}
                        <tbody>
                          {orders.map(o => (
                            <tr
                              key={o.orderId}
                              className="border-t border-gray-200 hover:bg-gray-50 transition"
                            >

                              <td className="px-4 py-3 font-medium text-indigo-600">
                                {o.orderId}
                              </td>

                              <td className="px-4 py-3">
                                {o.rfqId}
                              </td>

                              <td className="px-4 py-3">
                                {o.sellerName}
                              </td>

                              <td className="px-4 py-3">
                                {o.items?.map((i: any) => i.modelName).join(', ') || '—'}
                              </td>

                              <td className="px-4 py-3">
                                ₹{o.orderValue}
                              </td>

                              {/* STATUS BADGE */}
                              <td className="px-4 py-3">
                                <span className="px-2 py-1 text-xs rounded-full font-medium bg-green-100 text-green-700">
                                  {o.status}
                                </span>
                              </td>

                              {/* ACTIONS */}
                              <td className="px-4 py-3">
                                <div className="flex flex-wrap gap-2">

                                  {/* DOWNLOAD PO */}
                                  <button
                                    className="px-3 py-1 bg-indigo-600 text-white rounded-md text-xs hover:bg-indigo-700 transition"
                                    onClick={() => downloadPO(o.orderId)}
                                  >
                                    Download PO
                                  </button>

                                  {/* UPLOAD BENEFICIARIES */}
                                  <button
                                    className="bg-purple-600 text-white px-3 py-1 rounded-md text-xs hover:bg-purple-700 transition"
                                    onClick={() => {
                                      console.log("Clicked order:", o);
                                      setSelectedOrder(o);
                                      setShowBeneficiaryUpload(true);
                                    }}
                                  >
                                    Upload Beneficiaries
                                  </button>

                                  {/* PAYMENT FLOW */}
                                  {o.paymentStatus === "SUBMITTED" && (
                                    <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded">
                                      Waiting for Seller Approval
                                    </span>
                                  )}

                                  {(!o.paymentStatus || o.paymentStatus === "PENDING") && (
                                    <button
                                      className="bg-yellow-600 text-white px-3 py-1 rounded-md text-xs hover:bg-yellow-700 transition"
                                      onClick={() => {
                                        setPaymentModal(o)
                                        setPaymentForm({
                                          utr: "",
                                          amount: o.orderValue || "",
                                          date: new Date().toISOString().split("T")[0]
                                        })
                                      }}
                                    >
                                      Submit Payment
                                    </button>
                                  )}

                                  {o.paymentStatus === "RECEIPT_ISSUED" && (
                                    <button
                                      className="bg-green-600 text-white px-3 py-1 rounded-md text-xs hover:bg-green-700 transition"
                                      onClick={() => downloadReceipt(o.orderId)}
                                    >
                                      Receipt
                                    </button>
                                  )}

                                </div>
                              </td>

                            </tr>
                          ))}
                        </tbody>

                      </table>

                    </div>

                  )}

                </CardContent>
              </Card>

            </TabsContent>
            {/* ────────────────────────────────────────────── */}
            {/*                   BENEFICIARIES TAB            */}
            {/* ────────────────────────────────────────────── */}
            <TabsContent value="beneficiaries">

              {/* HEADER (same pattern as other tabs) */}
              <div className="bg-white p-4 rounded-2xl border shadow-sm flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800">
                  Beneficiaries
                </h3>
                <p className="text-sm text-gray-500">
                  Manage beneficiary allocation and voucher issuance
                </p>
              </div>

              <Card className="mb-6 bg-gray-50 border rounded-2xl shadow-sm">

                <CardContent>

                  {/* 🔥 ACTION BAR */}
                  <div className="flex flex-wrap justify-between items-center gap-3 mb-4">

                    <p className="text-sm text-gray-600">
                      Total Beneficiaries: {orderBeneficiaries.length}
                    </p>

                    <div className="flex gap-3 items-center flex-wrap">

                      {/* ORDER SELECT */}
                      <select
                        className="border border-gray-300 px-3 py-1.5 text-sm rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={selectedOrder?.orderId || ""}
                        onChange={(e) => {
                          const order = orderBeneficiaries.find(
                            b => b.orderId === e.target.value
                          )
                          setSelectedOrder(order || null)
                        }}
                      >
                        <option value="">Select Order</option>
                        {[...new Set(orderBeneficiaries.map(b => b.orderId))].map((id) => (
                          <option key={id} value={id}>
                            {id}
                          </option>
                        ))}
                      </select>

                      {/* GENERATE BUTTON */}
                      <button
                        className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 transition"
                        onClick={async () => {
                          const orderId = selectedOrder?.orderId
                          if (!orderId) {
                            alert("No order found")
                            return
                          }
                          const res = await fetch("/api/voucher/generate-all", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ orderId })
                          })
                          if (!res.ok) {
                            alert(await res.text())
                            return
                          }
                          alert("All vouchers generated successfully")
                          window.location.reload()
                        }}
                      >
                        Generate All Vouchers
                      </button>

                    </div>
                  </div>

                  {/* TABLE */}
                  <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">

                    <table className="w-full text-sm">

                      {/* HEADER */}
                      <thead className="bg-gray-100 text-gray-700">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Order ID</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Beneficiary</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Mobile</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase">City</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Pincode</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Reseller Name</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Reseller Code</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Voucher Status</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Action</th>
                        </tr>
                      </thead>

                      {/* BODY */}
                      <tbody>
                        {orderBeneficiaries.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="text-center text-gray-400 p-6">
                              No beneficiaries mapped yet
                            </td>
                          </tr>
                        ) : (
                          orderBeneficiaries.map((b, i) => (
                            <tr
                              key={i}
                              className="border-t border-gray-200 hover:bg-gray-50 transition"
                            >

                              <td className="px-4 py-3 text-indigo-600 font-medium">
                                {b.orderId}
                              </td>

                              <td className="px-4 py-3">
                                {b.beneficiary?.name}
                              </td>

                              <td className="px-4 py-3">
                                {b.beneficiary?.mobile}
                              </td>

                              <td className="px-4 py-3">
                                {b.beneficiary?.city}
                              </td>

                              <td className="px-4 py-3">
                                {b.beneficiary?.pincode}
                              </td>

                              <td className="px-4 py-3">
                                {b.reseller?.companyName || '—'}
                              </td>

                              <td className="px-4 py-3">
                                {b.reseller?.resellerCode || 'Not Available'}
                              </td>

                              {/* STATUS BADGE */}
                              <td className="px-4 py-3">
                                <span
                                  className={`px-2 py-1 text-xs rounded-full font-medium
                        ${b.voucherStatus === 'ISSUED' ? 'bg-green-100 text-green-700' : ''}
                        ${b.voucherStatus === 'NO_RESELLER' ? 'bg-red-100 text-red-600' : ''}
                        ${b.voucherStatus === 'MAPPED' ? 'bg-yellow-100 text-yellow-700' : ''}
                      `}
                                >
                                  {b.voucherStatus}
                                </span>
                              </td>

                              {/* ACTION */}
                              <td className="px-4 py-3">
                                {b.voucherStatus === 'ISSUED' ? (
                                  <span className="text-gray-500 text-xs">Issued</span>
                                ) : b.mappedResellerId ? (
                                  <span className="text-yellow-600 text-xs font-medium">Ready</span>
                                ) : (
                                  <span className="text-red-500 text-xs font-medium">Not Eligible</span>
                                )}
                              </td>

                            </tr>
                          ))
                        )}
                      </tbody>

                    </table>

                  </div>

                </CardContent>
              </Card>

            </TabsContent>
            {/* ────────────────────────────────────────────── */}
            {/*                  VOUCHERS TAB                  */}
            {/* ────────────────────────────────────────────── */}
            <TabsContent value="vouchers">

              {/* HEADER (same as other tabs) */}
              <div className="bg-white p-4 rounded-2xl border shadow-sm flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800">
                  Vouchers Tracker
                </h3>
                <p className="text-sm text-gray-500">
                  View, download and manage issued vouchers
                </p>
              </div>

              <Card className="mb-6 bg-gray-50 border rounded-2xl shadow-sm">

                <CardContent>

                  {/* TABLE WRAPPER */}
                  <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">

                    <table className="w-full text-sm">

                      {/* HEADER */}
                      <thead className="bg-gray-100 text-gray-700">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Voucher ID</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Order ID</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Beneficiary</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Mobile</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase">OEM</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Dealer</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Issued On</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Action</th>
                        </tr>
                      </thead>

                      {/* BODY */}
                      <tbody>
                        {vouchers.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="text-center p-6 text-gray-400">
                              No vouchers issued yet
                            </td>
                          </tr>
                        ) : (
                          vouchers.map((v) => (
                            <tr
                              key={v.voucherId}
                              className="border-t border-gray-200 hover:bg-gray-50 transition"
                            >

                              {/* Voucher ID */}
                              <td className="px-4 py-3 font-medium">
                                <button
                                  className="text-indigo-600 hover:underline"
                                  onClick={() => {
                                    setSelectedVoucher(v)
                                    setShowVoucherDetail(true)
                                  }}
                                >
                                  {v.voucherId}
                                </button>
                              </td>

                              {/* Order */}
                              <td className="px-4 py-3">
                                {v.orderId}
                              </td>

                              {/* Beneficiary */}
                              <td className="px-4 py-3">
                                {v.beneficiary?.name || "-"}
                              </td>

                              {/* Mobile */}
                              <td className="px-4 py-3">
                                {v.beneficiary?.mobile || "-"}
                              </td>

                              {/* OEM */}
                              <td className="px-4 py-3">
                                {v.reseller?.oemName || "—"}
                              </td>

                              {/* Dealer */}
                              <td className="px-4 py-3">
                                {v.reseller?.companyName || "Not Assigned"}
                              </td>

                              {/* STATUS BADGE */}
                              <td className="px-4 py-3">
                                <span
                                  className={`px-2 py-1 text-xs rounded-full font-medium
                        ${v.status === "ACTIVE" ? "bg-green-100 text-green-700" : ""}
                        ${v.status === "PENDING_RESELLER" ? "bg-yellow-100 text-yellow-700" : ""}
                        ${v.status !== "ACTIVE" && v.status !== "PENDING_RESELLER" ? "bg-gray-100 text-gray-600" : ""}
                      `}
                                >
                                  {v.status === "ACTIVE"
                                    ? "Issued"
                                    : v.status === "PENDING_RESELLER"
                                      ? "Pending Dealer"
                                      : v.status}
                                </span>
                              </td>

                              {/* DATE */}
                              <td className="px-4 py-3">
                                {new Date(v.createdAt).toLocaleDateString()}
                              </td>

                              {/* ACTIONS */}
                              <td className="px-4 py-3">
                                <div className="flex flex-wrap gap-2">

                                  {/* VIEW */}
                                  <button
                                    className="bg-indigo-600 text-white px-3 py-1 rounded-md text-xs hover:bg-indigo-700 transition"
                                    onClick={() =>
                                      window.open(
                                        `/api/documents/voucher/pdf?voucherId=${v.voucherId}`,
                                        "_blank"
                                      )
                                    }
                                  >
                                    View
                                  </button>

                                  {/* DOWNLOAD */}
                                  <button
                                    className="bg-green-600 text-white px-3 py-1 rounded-md text-xs hover:bg-green-700 transition"
                                    onClick={async () => {
                                      try {
                                        const res = await fetch(
                                          `/api/documents/voucher/pdf?voucherId=${v.voucherId}`
                                        )
                                        if (!res.ok) {
                                          alert("Download failed")
                                          return
                                        }
                                        const blob = await res.blob()
                                        const url = window.URL.createObjectURL(blob)
                                        const a = document.createElement("a")
                                        a.href = url
                                        a.download = `Voucher-${v.voucherId}.pdf`
                                        a.click()
                                        window.URL.revokeObjectURL(url)
                                      } catch (err) {
                                        console.error(err)
                                        alert("Error downloading voucher")
                                      }
                                    }}
                                  >
                                    Download
                                  </button>

                                  {/* SEND */}
                                  <button
                                    className="bg-blue-600 text-white px-3 py-1 rounded-md text-xs hover:bg-blue-700 transition"
                                    onClick={() =>
                                      alert(`Send voucher to ${v.beneficiary?.mobile}`)
                                    }
                                  >
                                    Send
                                  </button>

                                </div>
                              </td>

                            </tr>
                          ))
                        )}
                      </tbody>

                    </table>

                  </div>

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
          {/* Payment Modal */}
          {paymentModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
              <div className="bg-white p-6 rounded shadow-md w-[420px]">
                <h3 className="text-lg font-bold mb-4">Submit Payment</h3>
                <div className="text-sm mb-3">
                  <p><b>Order ID:</b> {paymentModal.orderId}</p>
                  <p><b>Seller:</b> {paymentModal.sellerName}</p>
                  <p><b>Amount:</b> ₹ {paymentModal.unitPrice}</p>
                </div>
                <input
                  type="text"
                  placeholder="Enter UTR / Payment Ref"
                  className="border p-2 w-full mb-3"
                  value={paymentForm.utr}
                  onChange={(e) => setPaymentForm({ ...paymentForm, utr: e.target.value })}
                />
                <input
                  type="date"
                  className="border p-2 w-full mb-3"
                  value={paymentForm.date}
                  onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })}
                />
                <div className="flex justify-between">
                  <button
                    className="bg-gray-500 text-white px-3 py-1 rounded"
                    onClick={() => setPaymentModal(null)}
                  >
                    Cancel
                  </button>
                  <button
                    className="bg-green-600 text-white px-3 py-1 rounded"
                    onClick={async () => {
                      if (!paymentForm.utr) {
                        alert("Enter UTR")
                        return
                      }
                      const res = await fetch("/api/payment/pay", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          orderId: paymentModal.orderId,
                          paymentRef: paymentForm.utr,
                          paymentDate: paymentForm.date,
                          amount: paymentModal.unitPrice
                        })
                      })
                      if (!res.ok) {
                        alert("Payment submission failed")
                        return
                      }
                      alert("Payment submitted successfully")
                      setPaymentModal(null)
                      window.location.reload()
                    }}
                  >
                    Submit
                  </button>
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
          {/* Beneficiary Upload Modal */}
          {/* Beneficiary Upload Modal */}
          {showBeneficiaryUpload && selectedOrder && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
                {/* HEADER */}
                <div className="flex justify-between mb-4">
                  <h3 className="font-semibold text-lg">
                    Upload Beneficiaries (Order Based)
                  </h3>
                  <Button onClick={() => setShowBeneficiaryUpload(false)}>
                    Close
                  </Button>
                </div>
                {/* PO DETAILS HEADER */}
                <div className="mb-4 border p-4 rounded bg-gray-50">
                  <p><strong>PO No:</strong> {selectedOrder.orderId}</p>
                  <p><strong>RFQ ID:</strong> {selectedOrder.rfqId}</p>
                  <p><strong>Buyer:</strong> {selectedOrder.buyerName || selectedOrder.buyerId}</p>
                  <p><strong>Seller:</strong> {selectedOrder.sellerName || "—"}</p>
                </div>
                {/* PO TABLE (MATCHING YOUR PDF) */}
                <div className="mb-6">
                  <table className="w-full text-sm border">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border p-2">Sr</th>
                        <th className="border p-2">Model</th>
                        <th className="border p-2">City</th>
                        <th className="border p-2">Qty</th>
                        <th className="border p-2">Unit Price</th>
                        <th className="border p-2">Total</th>
                      </tr>
                    </thead>
                    {/* ✅ ADD THIS */}
                    <tbody>
                      {(() => {
                        const rawItems = (selectedOrder?.items ?? []) as any[];

                        let rows: any[] = [];

                        rawItems.forEach((model: any, i: number) => {
                          const locations = model?.locations || [];

                          locations.forEach((loc: any, j: number) => {
                            const qty = Number(loc?.qty ?? 0);

                            // ✅ EXACT SAME LOGIC AS PO
                            const price = Number(loc?.quotedPrice ?? loc?.unitPrice ?? 0);

                            rows.push({
                              key: `${i}-${j}`,
                              sr: `${i + 1}.${j + 1}`,
                              model: model?.modelName || model?.model || "Unknown Model",
                              city: loc?.city || "—",
                              qty,
                              price,
                              total: qty * price
                            });
                          });
                        });

                        return rows.map((row) => (
                          <tr key={row.key}>
                            <td className="border p-2">{row.sr}</td>
                            <td className="border p-2">{row.model}</td>
                            <td className="border p-2">{row.city}</td>
                            <td className="border p-2">{row.qty}</td>
                            <td className="border p-2">
                              ₹ {row.price.toLocaleString()}
                            </td>
                            <td className="border p-2">
                              ₹ {row.total.toLocaleString()}
                            </td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
                {/* DOWNLOAD TEMPLATE */}
                <div className="mb-6">
                  <p className="font-semibold mb-2">Step 1: Download Template</p>
                  <button
                    className="bg-indigo-600 text-white px-4 py-2 rounded"
                    onClick={() => {
                      if (!selectedOrder?.orderId) {
                        alert("Order not ready");
                        console.error("selectedOrder:", selectedOrder);
                        return;
                      }
                      console.log("Downloading for:", selectedOrder.orderId);
                      window.open(
                        `/api/beneficiary/template?orderId=${selectedOrder.orderId}`
                      );
                    }}
                  >
                    Download Excel Template
                  </button>
                </div>
                {/* UPLOAD FILE */}
                <div className="mb-6">
                  <p className="font-semibold mb-2">Step 2: Upload Filled File</p>
                  <input
                    type="file"
                    accept=".xlsx"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="mb-3"
                  />
                  <button
                    className="bg-green-600 text-white px-4 py-2 rounded"
                    onClick={async () => {
                      if (!file) {
                        alert("Select file first");
                        return;
                      }
                      const formData = new FormData();
                      formData.append("file", file);
                      formData.append("orderId", selectedOrder.orderId);
                      const res = await fetch("/api/buyer/order/beneficiaries", {
                        method: "POST",
                        body: formData
                      });
                      const data = await res.json();
                      alert(`Uploaded: ${data.success}, Failed: ${data.failed}`);
                      await loadBeneficiaries();
                      setShowBeneficiaryUpload(false);
                    }}
                  >
                    Upload & Process
                  </button>
                </div>
                {/* FOOTER */}
                <div className="flex justify-end">
                  <Button onClick={() => setShowBeneficiaryUpload(false)}>
                    Cancel
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
                      <th className="p-2">Model</th>
                      <th className="p-2">City</th>
                      <th className="p-2">Qty</th>
                      <th className="p-2">Price</th>
                      <th className="p-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>

                    {bids.length === 0 ? (

                      <tr>
                        <td colSpan={6} className="text-center p-4 text-gray-400">
                          No bids received yet for this RFQ
                        </td>
                      </tr>

                    ) : (

                      bids.map((b) => (

                        (b.locationQuotes || []).map((model: any) => (

                          (model.locations || []).map((loc: any, idx: number) => {

                            const isL1 = Number(loc.quotedPrice) === lowestPrice

                            return (
                              <tr
                                key={`${b.bidId}-${idx}`}
                                className={`border-t ${isL1 ? 'bg-green-50 border-l-4 border-green-600' : ''}`}
                              >

                                <td className="p-2">
                                  {b.sellerName}
                                </td>

                                <td className="p-2">
                                  {model.modelName}
                                </td>

                                <td className="p-2">
                                  {loc.city}
                                </td>

                                <td className="p-2">
                                  {loc.qty}
                                </td>

                                <td className="p-2 font-semibold">
                                  ₹{Number(loc.quotedPrice).toLocaleString()}
                                </td>

                                {/* Action column */}
                                <td className="p-2 text-center">

                                  {isL1 && (
                                    <button
                                      className="bg-indigo-600 text-white px-2 py-1 text-xs rounded"
                                      onClick={() => handleSelectL1(b, selectedRfq)}
                                    >
                                      Select L1
                                    </button>
                                  )}

                                </td>

                              </tr>
                            )

                          })

                        ))

                      ))

                    )}

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