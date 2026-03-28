import { PDFDocument, StandardFonts } from "pdf-lib"

/* ================= AMOUNT IN WORDS ================= */

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

/* ================= QUOTATION PDF ================= */

export async function generateQuotation(data: any) {

  const pdfDoc = await PDFDocument.create()

  const page = pdfDoc.addPage([600, 800])

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  let y = 760

  /* HEADER */

  page.drawText("GiftConnect Marketplace", {
    x: 50,
    y,
    size: 16,
    font: bold
  })

  y -= 25

  page.drawText("QUOTATION", {
    x: 50,
    y,
    size: 14,
    font: bold
  })

  y -= 30

  page.drawText(`Quotation No: ${data.quotationNo}`, { x: 50, y, size: 10, font })
  page.drawText(`RFQ Ref: ${data.rfqId}`, { x: 300, y, size: 10, font })

  y -= 15

  page.drawText(`Date: ${data.date}`, { x: 50, y, size: 10, font })
  page.drawText(`Validity: ${data.validityDays} Days`, { x: 300, y, size: 10, font })

  y -= 30

  page.drawText(`Buyer: ${data.buyer.name}`, { x: 50, y, size: 10, font })
  page.drawText(`Seller: ${data.seller.name}`, { x: 300, y, size: 10, font })

  y -= 15

  page.drawText(`Buyer GST: ${data.buyer.gst}`, { x: 50, y, size: 10, font })
  page.drawText(`Seller GST: ${data.seller.gst}`, { x: 300, y, size: 10, font })

  y -= 30

  /* TABLE HEADER */

  page.drawText("Sr", { x: 50, y, size: 10, font: bold })
  page.drawText("Model", { x: 80, y, size: 10, font: bold })
  page.drawText("City", { x: 220, y, size: 10, font: bold })
  page.drawText("Qty", { x: 300, y, size: 10, font: bold })
  page.drawText("Unit Price", { x: 350, y, size: 10, font: bold })
  page.drawText("Total", { x: 470, y, size: 10, font: bold })

  y -= 15

  let subtotal = 0

  /* TABLE ROWS */

  data.items.forEach((item: any, i: number) => {

    const rowTotal = item.qty * item.unitPrice

    subtotal += rowTotal

    page.drawText(String(i + 1), { x: 50, y, size: 10, font })
    page.drawText(item.model, { x: 80, y, size: 10, font })
    page.drawText(item.city, { x: 220, y, size: 10, font })
    page.drawText(String(item.qty), { x: 300, y, size: 10, font })
    page.drawText(`Rs. ${item.unitPrice.toLocaleString()}`, { x: 350, y, size: 10, font })
    page.drawText(`Rs. ${rowTotal.toLocaleString()}`, { x: 470, y, size: 10, font })

    y -= 15
  })

  y -= 20

  /* TOTALS */

  page.drawText(`Sub Total: Rs. ${subtotal.toLocaleString()}`, {
    x: 350,
    y,
    size: 11,
    font
  })

  y -= 15

  page.drawText(`Grand Total: Rs. ${subtotal.toLocaleString()}`, {
    x: 350,
    y,
    size: 12,
    font: bold
  })

  y -= 25

  /* AMOUNT IN WORDS */

  page.drawText(
    `Amount in Words: Rupees ${amountInWords(subtotal)} Only`,
    { x: 50, y, size: 11, font }
  )

  y -= 30

  /* PRICE BASIS */

  page.drawText("Price Basis", { x: 50, y, size: 12, font: bold })

  y -= 15

  page.drawText(
    "Prices quoted above represent Ex-Showroom vehicle price inclusive of GST.",
    { x: 50, y, size: 10, font }
  )

  y -= 12

  page.drawText(
    "Additional charges such as RTO, insurance and accessories shall be payable",
    { x: 50, y, size: 10, font }
  )

  y -= 12

  page.drawText(
    "directly by the beneficiary to the authorized dealer at the time of redemption.",
    { x: 50, y, size: 10, font }
  )

  y -= 25

  /* VOUCHER REDEMPTION */

  page.drawText("Voucher Redemption", { x: 50, y, size: 12, font: bold })

  y -= 15

  page.drawText(
    "Gift vouchers issued pursuant to this quotation will be redeemable by beneficiaries",
    { x: 50, y, size: 10, font }
  )

  y -= 12

  page.drawText(
    "nominated by the Buyer at authorized reseller/dealer locations of the Seller.",
    { x: 50, y, size: 10, font }
  )

  y -= 25

  /* PAYMENT TERMS */

  page.drawText("Payment Terms", { x: 50, y, size: 12, font: bold })

  y -= 15

  page.drawText(
    "100% advance payment shall be made by the Buyer against a Proforma Invoice",
    { x: 50, y, size: 10, font }
  )

  y -= 12

  page.drawText(
    "issued by the Seller.",
    { x: 50, y, size: 10, font }
  )

  y -= 25

  /* DISCLAIMER */

  page.drawText("Disclaimer", { x: 50, y, size: 12, font: bold })

  y -= 15

  page.drawText(
    "This document is a quotation only and does not constitute a tax invoice.",
    { x: 50, y, size: 10, font }
  )

  y -= 12

  page.drawText(
    "GiftConnect operates solely as a digital marketplace facilitator.",
    { x: 50, y, size: 10, font }
  )

  y -= 35

  /* SIGNATURE */

  page.drawText(`For ${data.seller.name}`, { x: 350, y, size: 11, font })

  y -= 40

  page.drawText("Authorized Signatory", { x: 350, y, size: 10, font })

  y -= 25

  /* FOOTER */

  page.drawText(
    "Powered by GiftConnect – Enterprise Marketplace for Corporate Vehicle Programs",
    { x: 50, y, size: 9, font }
  )

  const pdfBytes = await pdfDoc.save()

  return pdfBytes
}