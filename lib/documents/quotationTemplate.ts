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

export function quotationHTML(data:any){

const rows = data.items.map((item:any,i:number)=>{

const total=item.qty*item.unitPrice

return `
<tr>
<td>${i+1}</td>
<td>${item.model}</td>
<td>${item.city}</td>
<td>${item.qty}</td>
<td>₹ ${item.unitPrice.toLocaleString()}</td>
<td>₹ ${total.toLocaleString()}</td>
</tr>
`

}).join("")

const subtotal=data.items.reduce(
(a:any,b:any)=>a+(b.qty*b.unitPrice),0)

return `
<html>
<head>

<style>

body{
font-family:Arial;
font-size:12px;
margin:40px;
}

.header{
display:flex;
align-items:center;
gap:10px;
}

.logo{
width:32px;
height:32px;
border-radius:50%;
background:#4f46e5;
color:white;
display:flex;
align-items:center;
justify-content:center;
font-weight:bold;
}

.title{
font-size:16px;
font-weight:bold;
}

table{
width:100%;
border-collapse:collapse;
margin-top:20px;
}

th,td{
border:1px solid #ddd;
padding:6px;
text-align:left;
}

th{
background:#f5f5f5;
}

.section{
margin-top:20px;
}

.footer{
margin-top:40px;
font-size:10px;
}

</style>

</head>

<body>

<div class="header">
<div class="logo">GC</div>
<div class="title">GiftConnect Marketplace</div>
</div>

<h2>QUOTATION</h2>

<div>
Quotation No ${data.quotationNo}<br/>
RFQ Reference ${data.rfqId}<br/>
Date ${data.date}<br/>
Price Validity ${data.validityDays} Days
</div>

<div class="section">

<table>

<tr>
<th colspan="3">Buyer Details</th>
<th colspan="3">Seller Details</th>
</tr>

<tr>
<td colspan="3">${data.buyer.name}<br/>GSTIN: ${data.buyer.gst}</td>
<td colspan="3">${data.seller.name}<br/>GSTIN: ${data.seller.gst}</td>
</tr>

</table>

</div>

<table>

<tr>
<th>Sr</th>
<th>Model</th>
<th>City</th>
<th>Qty</th>
<th>Unit Price (Ex-Showroom)</th>
<th>Total</th>
</tr>

${rows}

</table>

<div class="section">

Sub Total ₹ ${subtotal.toLocaleString()}<br/>
GST Included in Ex-Showroom Price<br/>
<b>Grand Total ₹ ${subtotal.toLocaleString()}</b><br/><br/>

Amount in Words: <b>Rupees ${amountInWords(subtotal)} Only</b>

</div>

<div class="section">
<b>Price Basis</b><br/>
Prices quoted above represent Ex-Showroom vehicle price inclusive of GST.
</div>

<div class="section">
<b>Voucher Redemption</b><br/>
Gift vouchers issued pursuant to this quotation will be redeemable by beneficiaries.
</div>

<div class="section">
<b>Payment Terms</b><br/>
100% advance payment shall be made by the Buyer.
</div>

<div class="section">
<b>Disclaimer</b><br/>
This document is a quotation only and does not constitute a tax invoice.
</div>

<div class="section" style="text-align:right">

For ${data.seller.name}<br/><br/><br/>
Authorized Signatory

</div>

<div class="footer">
Powered by GiftConnect – Enterprise Marketplace for Corporate Vehicle Programs
</div>

</body>
</html>
`
}