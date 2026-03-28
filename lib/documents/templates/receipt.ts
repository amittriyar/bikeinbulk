function amountInWords(num: number) {

  const ones = [
    "", "One","Two","Three","Four","Five","Six","Seven","Eight","Nine",
    "Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen",
    "Seventeen","Eighteen","Nineteen"
  ]

  const tens = [
    "", "", "Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"
  ]

  function convert(n: number): string {
    if (n < 20) return ones[n]

    if (n < 100)
      return tens[Math.floor(n / 10)] + " " + ones[n % 10]

    if (n < 1000)
      return ones[Math.floor(n / 100)] + " Hundred " + convert(n % 100)

    if (n < 100000)
      return convert(Math.floor(n / 1000)) + " Thousand " + convert(n % 1000)

    if (n < 10000000)
      return convert(Math.floor(n / 100000)) + " Lakh " + convert(n % 100000)

    return convert(Math.floor(n / 10000000)) + " Crore " + convert(n % 10000000)
  }

  return convert(num).trim()
}

export function receiptHTML(data: any) {

  const rows = (data.items || []).map((item: any, i: number) => {

    const total = item.qty * item.unitPrice

    return `
<tr>
<td>${i + 1}</td>
<td>${item.model || item.category}</td>
<td>${item.city}</td>
<td>${item.qty}</td>
<td>₹ ${Number(item.unitPrice).toLocaleString("en-IN")}</td>
<td>₹ ${total.toLocaleString("en-IN")}</td>
</tr>
`
  }).join("")

  return `
<html>
<head>
<style>
body { font-family: Arial; padding:40px; font-size:12px; }

.header {
display:flex; align-items:center; gap:10px;
}

.logo {
width:30px; height:30px; border-radius:50%;
background:#4f46e5; color:white;
display:flex; align-items:center; justify-content:center;
font-weight:bold;
}

table { width:100%; border-collapse:collapse; margin-top:20px; }

th, td { border:1px solid #ccc; padding:6px; }

th { background:#f5f5f5; }

.section { margin-top:20px; }
</style>
</head>

<body>

<div class="header">
<div class="logo">GC</div>
<div><b>GiftConnect Marketplace</b></div>
</div>

<h2>PAYMENT RECEIPT</h2>

<div>
<b>Receipt No:</b> ${data.receiptNo}<br/>
<b>Order Ref:</b> ${data.orderId}<br/>
<b>Date:</b> ${data.date}<br/>
<b>Payment Ref:</b> ${data.paymentRef || "NA"}
</div>

<div class="section">

<table>
<tr>
<th>Buyer Details</th>
<th>Seller Details</th>
</tr>

<tr>
<td>${data?.buyer?.name || "-"}</td>
<td>${data?.seller?.name || "-"}</td>
</tr>

</table>

</div>

<table>

<tr>
<th>Sr</th>
<th>Category</th>
<th>Location</th>
<th>Qty</th>
<th>Unit Price (₹)</th>
<th>Total (₹)</th>
</tr>

${rows}

</table>

<div class="section">

<b>Total ₹ ${Number(data.total).toLocaleString("en-IN")}</b>

</div>

<div class="section">

<b>Amount in Words:</b> Rupees ${amountInWords(data.total)} Only

</div>

<div class="section">

<b>Notes</b><br/>
1. Payment received against the above order.<br/>
2. This is a system generated receipt.<br/>
3. GST is included in the above amount unless specified.

</div>

<div class="section" style="text-align:right">

For ${data.seller.name}<br/><br/><br/>
Authorized Signatory

</div>

<div class="section" style="font-size:10px">

Powered by GiftConnect – Enterprise Marketplace

</div>

</body>
</html>
`
}