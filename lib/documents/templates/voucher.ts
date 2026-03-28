import QRCode from "qrcode"

export async function voucherHTML(data: any) {

  const qrData = `${process.env.BASE_URL}/redeem?voucherId=${data.voucherId}`

  
  const qrImage = await QRCode.toDataURL(qrData)

  return `
<html>
<head>
<style>
body {
  font-family: Arial;
  padding: 30px;
  font-size: 12px;
}

.header {
  display:flex;
  align-items:center;
  gap:10px;
}

.logo {
  width:35px;
  height:35px;
  border-radius:50%;
  background:#4f46e5;
  color:white;
  display:flex;
  align-items:center;
  justify-content:center;
  font-weight:bold;
}

.voucher-box {
  border:2px dashed #333;
  padding:20px;
  margin-top:20px;
}

.amount-box {
  font-size:22px;
  font-weight:bold;
  margin-top:10px;
  color:#111;
}

.amount-label {
  font-size:11px;
  color:#555;
}

.section {
  margin-top:15px;
}

.qr {
  text-align:right;
  margin-top:10px;
}

.footer {
  margin-top:20px;
  font-size:11px;
  line-height:1.5;
}
</style>
</head>

<body>

<!-- HEADER -->
<div class="header">
  <div class="logo">GC</div>
  <div><b>GiftConnect Marketplace</b></div>
</div>

<h2>GIFT VOUCHER</h2>

<div class="voucher-box">

  <div><b>Voucher Code:</b> ${data.voucherId}</div>
  <div><b>Date:</b> ${data.date}</div>

  <!-- ✅ CLEAN AMOUNT DISPLAY -->
  <div class="amount-box">
    ₹ ${Math.round(data.amount).toLocaleString("en-IN")}
  </div>
  <div class="amount-label">Voucher Value</div>

  <div class="section">
    <b>Issued To:</b> ${data.beneficiary?.name || "NA"}<br/>
    <b>Mobile:</b> ${data.beneficiary?.mobile || "NA"}
  </div>

  <div class="section">
    <b>Corporate Buyer:</b> ${data.buyerName || "Corporate Client"}
  </div>

  <!-- ✅ FIXED LOCATION DUPLICATION -->
  <div class="section">
    <b>Redeemable At:</b><br/>
    ${data.reseller?.companyName || "Dealer to be assigned"}<br/>
    ${data.reseller?.city ? data.reseller.city + "," : ""} ${data.reseller?.state || ""}
  </div>

  <div class="section">
    <b>Valid Till:</b> ${data.expiryDate || "As per policy"}
  </div>

  <div class="section">
    <b>Status:</b> ${data.status}
  </div>

  <!-- QR -->
  <div class="qr">
    <img src="${qrImage}" width="120"/>
    <div style="font-size:10px;">Scan for Redemption</div>
  </div>

</div>

<!-- TERMS -->
<div class="footer">

<b>Redemption Instructions:</b><br/>
1. Visit assigned dealer or nearest authorized dealer.<br/>
2. Present this voucher (QR scan required).<br/>
3. Provide valid ID & mobile verification.<br/>
4. Voucher amount will be adjusted against vehicle purchase.<br/><br/>

<b>Terms & Conditions:</b><br/>
• This voucher is valid only for vehicle purchase.<br/>
• Non-transferable & cannot be exchanged for cash.<br/>
• Valid only till expiry date mentioned above.<br/>
• Subject to dealer availability and OEM policies.<br/>
• Any price difference to be paid by beneficiary.<br/>
• GiftConnect acts as facilitator only.<br/>

</div>

</body>
</html>
`
}