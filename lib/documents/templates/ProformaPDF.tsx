import {
  Document,
  Page,
  Text,
  View,
  StyleSheet
} from "@react-pdf/renderer"

/* ===============================
   STYLES
=============================== */

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10
  },

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
    paddingTop: 3,
    fontSize: 8,
    marginRight: 6
  },

  title: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10
  },

  section: {
    marginBottom: 10
  },

  table: {
    borderWidth: 1,
    marginTop: 10
  },

  row: {
    flexDirection: "row"
  },

  /* COLUMN WIDTHS */
  colSr: { width: "8%" },
  colModel: { width: "24%" },
  colCity: { width: "16%" },
  colQty: { width: "10%" },
  colPrice: { width: "21%" },
  colTotal: { width: "21%" },

  cellHeader: {
    borderRightWidth: 1,
    borderBottomWidth: 1,
    padding: 4,
    fontWeight: "bold",
    backgroundColor: "#eee"
  },

  cell: {
    borderRightWidth: 1,
    borderBottomWidth: 1,
    padding: 4
  },

  textRight: {
    textAlign: "right"
  },

  total: {
    marginTop: 10,
    fontWeight: "bold"
  },

  small: {
    fontSize: 8,
    marginTop: 10
  }
})

/* ===============================
   AMOUNT IN WORDS
=============================== */

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

/* ===============================
   COMPONENT
=============================== */

export default function ProformaPDF({ data }: any) {

  return (
    <Document>
      <Page style={styles.page}>

        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.logo}>GC</Text>
          <Text>GiftConnect Marketplace</Text>
        </View>

        <Text style={styles.title}>PROFORMA INVOICE</Text>

        {/* META */}
        <View style={styles.section}>
          <Text>Invoice No {data.invoiceNo}</Text>
          <Text>RFQ Reference {data.rfqId}</Text>
          <Text>Date {data.date}</Text>
        </View>

        {/* BUYER SELLER */}
        <View style={styles.table}>
          <View style={styles.row}>
            <Text style={[styles.cellHeader, { flex: 1 }]}>Buyer Details</Text>
            <Text style={[styles.cellHeader, { flex: 1 }]}>Seller Details</Text>
          </View>

          <View style={styles.row}>
            <Text style={[styles.cell, { flex: 1 }]}>
              {data.buyer.name}
              {"\n"}GSTIN: {data.buyer.gst}
            </Text>

            <Text style={[styles.cell, { flex: 1 }]}>
              {data.seller.name}
              {"\n"}GSTIN: {data.seller.gst}
            </Text>
          </View>
        </View>

        {/* ITEMS */}
        <View style={styles.table}>

          <View style={styles.row}>
            <Text style={[styles.cellHeader, styles.colSr]}>Sr</Text>
            <Text style={[styles.cellHeader, styles.colModel]}>Model</Text>
            <Text style={[styles.cellHeader, styles.colCity]}>City</Text>
            <Text style={[styles.cellHeader, styles.colQty]}>Qty</Text>
            <Text style={[styles.cellHeader, styles.colPrice]}>
              Unit Price (Ex-Showroom)
            </Text>
            <Text style={[styles.cellHeader, styles.colTotal]}>Total</Text>
          </View>

          {(data.items || []).map((item: any, i: number) => {

            const total = item.qty * item.unitPrice

            return (
              <View style={styles.row} key={i}>

                <Text style={[styles.cell, styles.colSr]}>
                  {i + 1}
                </Text>

                <Text style={[styles.cell, styles.colModel]}>
                  {item.model}
                </Text>

                <Text style={[styles.cell, styles.colCity]}>
                  {item.city}
                </Text>

                <Text style={[styles.cell, styles.colQty]}>
                  {item.qty}
                </Text>

                <Text style={[styles.cell, styles.colPrice, styles.textRight]}>
                  ₹ {Number(item.unitPrice).toLocaleString("en-IN")}
                </Text>

                <Text style={[styles.cell, styles.colTotal, styles.textRight]}>
                  ₹ {Number(total).toLocaleString("en-IN")}
                </Text>

              </View>
            )
          })}

        </View>

        {/* TOTAL */}
        <Text style={styles.total}>
          Grand Total ₹ {Number(data.total).toLocaleString("en-IN")}
        </Text>

        <Text>
          Amount in Words: Rupees {amountInWords(data.total)} Only
        </Text>

        {/* PAYMENT TERMS */}
        <View style={styles.section}>
          <Text>Payment Terms</Text>
          <Text>100% advance payment shall be made by the Buyer against this Proforma Invoice.</Text>
        </View>

        {/* TERMS */}
        <View style={styles.section}>
          <Text>Terms & Conditions</Text>

          <Text>1. This Proforma Invoice is issued for advance payment.</Text>
          <Text>2. Prices are Ex-Showroom inclusive of GST.</Text>
          <Text>3. Additional charges to be borne by beneficiary.</Text>
          <Text>4. Delivery starts after full payment.</Text>
          <Text>5. GiftConnect acts as facilitator only.</Text>
        </View>

        <Text style={styles.small}>
          Powered by GiftConnect – Enterprise Marketplace
        </Text>

      </Page>
    </Document>
  )
}