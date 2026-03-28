export function proformaHTML(data: any) {

const rows = data.items.map((item:any,i:number)=>{

const total = item.qty * item.unitPrice

return `
<tr>
<td>${i+1}</td>
<td>${item.model}</td>
<td>${item.city}</td>
<td>${item.qty}</td>
<td>₹ ${item.unitPrice.toLocaleString("en-IN")}</td>
<td>₹ ${total.toLocaleString("en-IN")}</td>
</tr>
`

}).join("")

function amountInWords(num: number) {
  const a = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine",
  "Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen",
  "Seventeen","Eighteen","Nineteen"]

  const b = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"]

  function convert(n:number):string {
    if(n<20) return a[n]
    if(n<100) return b[Math.floor(n/10)]+" "+a[n%10]
    if(n<1000) return a[Math.floor(n/100)]+" Hundred "+convert(n%100)
    if(n<100000) return convert(Math.floor(n/1000))+" Thousand "+convert(n%1000)
    if(n<10000000) return convert(Math.floor(n/100000))+" Lakh "+convert(n%100000)
    return convert(Math.floor(n/10000000))+" Crore "+convert(n%10000000)
  }

  return convert(num)
}

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

<h2>PROFORMA INVOICE</h2>

<div>
<b>Invoice No</b> ${data.invoiceNo}<br/>
<b>RFQ Reference</b> ${data.rfqId}<br/>
<b>Date</b> ${data.date}
</div>

<div class="section">

<table>
<tr>
<th>Buyer Details</th>
<th>Seller Details</th>
</tr>

<tr>
<td>
${data.buyer.name}<br/>
GSTIN: ${data.buyer.gst}
</td>

<td>
${data.seller.name}<br/>
GSTIN: ${data.seller.gst}
</td>
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

Sub Total ₹ ${data.total.toLocaleString("en-IN")}<br/>
GST Included in Ex-Showroom Price<br/>
<b>Grand Total ₹ ${data.total.toLocaleString("en-IN")}</b><br/><br/>

Amount in Words: <b>Rupees ${amountInWords(data.total)} Only</b>

</div>

<div class="section">

<b>Payment Terms</b><br/>
100% advance payment shall be made by the Buyer against this Proforma Invoice.

<div class="section">

<b>Terms & Conditions</b><br/><br/>

1. This Proforma Invoice is issued for the purpose of advance payment and does not constitute a tax invoice.<br/><br/>

2. Prices mentioned are Ex-Showroom and inclusive of applicable GST unless stated otherwise.<br/><br/>

3. Additional charges such as RTO registration, insurance, accessories, handling charges and statutory levies shall be borne by the beneficiary at the time of vehicle delivery.<br/><br/>

4. 100% advance payment shall be made by the Buyer against this Proforma Invoice prior to issuance of Purchase Order.<br/><br/>

5. Delivery timelines shall be applicable from the date of receipt of full payment and confirmation of order.<br/><br/>

6. GiftConnect acts solely as a digital marketplace facilitator and is not a party to the sale transaction between Buyer and Seller. <br/><br/>

7. The Seller shall be responsible for vehicle availability, delivery, documentation and after-sales service.<br/><br/>

8. Any disputes arising shall be resolved mutually between Buyer and Seller and subject to applicable jurisdiction laws.<br/><br/>

9. this Proforma Invoice is valid for 30 days from the date of issue and subject to change without prior notice.<br/><br/>

10. By making payment against this Proforma Invoice, the Buyer agrees to the terms and conditions stated herein.<br/><br/>


</div>

<div class="section" style="font-size:10px">

Powered by GiftConnect – Enterprise Marketplace for Corporate Vehicle Programs: GiftConnect operates as a digital marketplace facilitator and does not undertake ownership or sale of goods.

</div>

</body>
</html>
`
}