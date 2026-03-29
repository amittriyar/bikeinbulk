import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"

function amountInWords(num: number) {
  const ones = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine",
  "Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen",
  "Seventeen","Eighteen","Nineteen"]

  const tens = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"]

  function convert(n: number): string {
    if (n < 20) return ones[n]
    if (n < 100) return tens[Math.floor(n/10)] + " " + ones[n%10]
    if (n < 1000) return ones[Math.floor(n/100)] + " Hundred " + convert(n%100)
    if (n < 100000) return convert(Math.floor(n/1000)) + " Thousand " + convert(n%1000)
    if (n < 10000000) return convert(Math.floor(n/100000)) + " Lakh " + convert(n%100000)
    return convert(Math.floor(n/10000000)) + " Crore " + convert(n%10000000)
  }

  return convert(num).trim()
}

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10
  },

  logo: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#4f46e5",
    color: "white",
    textAlign: "center",
    fontSize: 10,
    paddingTop: 3,
    marginRight: 6
  },

  title: {
    fontSize: 14,
    fontWeight: "bold"
  },

  section: {
    marginTop: 15
  },

  table: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#ddd"
  },

  row: {
    flexDirection: "row"
  },

  th: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 5,
    borderRightWidth: 1,
    borderColor: "#ddd",
    fontWeight: "bold"
  },

  td: {
    flex: 1,
    padding: 5,
    borderRightWidth: 1,
    borderTopWidth: 1,
    borderColor: "#ddd"
  },

  footer: {
    marginTop: 30,
    fontSize: 9
  }
})

export default function QuotationPDF({ data }: any) {

  const items = data.items || []
  const subtotal = Number(data.subtotal) || 0

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.logo}>GC</Text>
          <Text style={styles.title}>GiftConnect Marketplace</Text>
        </View>

        <Text style={{ fontSize: 12, fontWeight: "bold" }}>QUOTATION</Text>

        {/* DETAILS */}
        <View>
          <Text>Quotation No {data.quotationNo}</Text>
          <Text>RFQ Reference {data.rfqId}</Text>
          <Text>Date {data.date}</Text>
          <Text>Price Validity {data.validityDays} Days</Text>
        </View>

        {/* BUYER SELLER TABLE */}
        <View style={styles.section}>
          <View style={[styles.row, { borderWidth: 1, borderColor: "#ddd" }]}>
            <Text style={[styles.th, { flex: 3 }]}>Buyer Details</Text>
            <Text style={[styles.th, { flex: 3 }]}>Seller Details</Text>
          </View>

          <View style={[styles.row, { borderWidth: 1, borderTopWidth: 0, borderColor: "#ddd" }]}>
            <Text style={[styles.td, { flex: 3 }]}>
              {data.buyer?.name || "-"}{"\n"}GSTIN: {data.buyer?.gst || "NA"}
            </Text>
            <Text style={[styles.td, { flex: 3 }]}>
              {data.seller?.name || "-"}{"\n"}GSTIN: {data.seller?.gst || "NA"}
            </Text>
          </View>
        </View>

        {/* ITEMS TABLE */}
        <View style={styles.table}>

          <View style={styles.row}>
            <Text style={styles.th}>Sr</Text>
            <Text style={styles.th}>Model</Text>
            <Text style={styles.th}>City</Text>
            <Text style={styles.th}>Qty</Text>
            <Text style={styles.th}>Unit Price (Ex-Showroom)</Text>
            <Text style={styles.th}>Total</Text>
          </View>

          {items.map((item: any, i: number) => {

            const qty = Number(item.qty) || 0
            const price = Number(item.unitPrice) || 0
            const total = qty * price

            return (
              <View key={i} style={styles.row}>
                <Text style={styles.td}>{i + 1}</Text>
                <Text style={styles.td}>{item.model || "-"}</Text>
                <Text style={styles.td}>{item.city || "-"}</Text>
                <Text style={styles.td}>{qty}</Text>
                <Text style={styles.td}>Rs. {price.toLocaleString()}</Text>
                <Text style={styles.td}>Rs. {total.toLocaleString()}</Text>
              </View>
            )
          })}
        </View>

        {/* TOTAL */}
        <View style={styles.section}>
          <Text>Sub Total Rs. {subtotal.toLocaleString()}</Text>
          <Text>GST Included in Ex-Showroom Price</Text>
          <Text style={{ fontWeight: "bold" }}>
            Grand Total Rs. {subtotal.toLocaleString()}
          </Text>

          <Text>
            {"\n"}Amount in Words: <Text style={{ fontWeight: "bold" }}>
              Rupees {amountInWords(subtotal)} Only
            </Text>
          </Text>
        </View>

        {/* TERMS */}
        <View style={styles.section}>
          <Text style={{ fontWeight: "bold" }}>Price Basis</Text>
          <Text>Prices quoted above represent Ex-Showroom vehicle price inclusive of GST.</Text>

          <Text style={{ fontWeight: "bold", marginTop: 8 }}>Voucher Redemption</Text>
          <Text>Gift vouchers issued pursuant to this quotation will be redeemable by beneficiaries.</Text>

          <Text style={{ fontWeight: "bold", marginTop: 8 }}>Payment Terms</Text>
          <Text>100% advance payment shall be made by the Buyer.</Text>

          <Text style={{ fontWeight: "bold", marginTop: 8 }}>Disclaimer</Text>
          <Text>This document is a quotation only and does not constitute a tax invoice.</Text>
        </View>

        {/* SIGN */}
        <View style={{ marginTop: 20, alignItems: "flex-end" }}>
          <Text>For {data.seller?.name || "Seller"}</Text>
          <Text>{"\n\n"}Authorized Signatory</Text>
        </View>

        {/* FOOTER */}
        <Text style={styles.footer}>
          Powered by GiftConnect – Enterprise Marketplace for Corporate Vehicle Programs
        </Text>

      </Page>
    </Document>
  )
}