'use client';

export default function RFQPage() {

  const submit = async () => {
    await fetch('/api/buyer/rfq', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        buyerId: 'BUYER_001',
        rfqType: 'BUDGET',
        items: [
          {
            requestedQty: 500
          }
        ]
      })
    });

    window.location.href = '/sellersdashboard';
  };

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-4">Submit RFQ</h1>

      <button
        onClick={submit}
        className="bg-indigo-600 text-white px-6 py-3 rounded"
      >
        Send RFQ to OEMs
      </button>
    </div>
  );
}