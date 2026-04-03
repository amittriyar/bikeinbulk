import {
  Document,
  Page,
  Text,
  View,
  StyleSheet
} from "@react-pdf/renderer"

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 10 },

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

  title: { fontSize: 14, fontWeight: "bold", marginBottom: 10 },

  section: { marginBottom: 10 },

  table: { borderWidth: 1, marginTop: 10 },

  row: { flexDirection: "row" },

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

  textRight: { textAlign: "right" }
})

function amountInWords(num: number) {
  const ones = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine",
  "Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen",
  "Seventeen","Eighteen","Nineteen"]

  const tens = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"]

  function convert(n:number):string {
    if(n<20) return ones[n]
    if(n<100) return tens[Math.floor(n/10)]+" "+ones[n%10]
    if(n<1000) return ones[Math.floor(n/100)]+" Hundred "+convert(n%100)
    if(n<100000) return convert(Math.floor(n/1000))+" Thousand "+convert(n%1000)
    if(n<10000000) return convert(Math.floor(n/100000))+" Lakh "+convert(n%100000)
    return convert(Math.floor(n/10000000))+" Crore "+convert(n%10000000)
  }

  return convert(num)
}

export default function ReceiptPDF({ data }: any) {
  return (
    <Document>
      <Page style={styles.page}>

        <View style={styles.header}>
          <Text style={styles.logo}>GC</Text>
          <Text>GiftConnect Marketplace</Text>
        </View>

        <Text style={styles.title}>PAYMENT RECEIPT</Text>

        <View style={styles.section}>
          <Text>Receipt No: {data.receiptNo}</Text>
          <Text>Order Ref: {data.orderId}</Text>
          <Text>Date: {data.date}</Text>
          <Text>Payment Ref: {data.paymentRef}</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.row}>
            <Text style={[styles.cellHeader, { flex: 1 }]}>Buyer</Text>
            <Text style={[styles.cellHeader, { flex: 1 }]}>Seller</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.cell, { flex: 1 }]}>{data.buyer.name}</Text>
            <Text style={[styles.cell, { flex: 1 }]}>{data.seller.name}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.row}>
            <Text style={[styles.cellHeader, styles.colSr]}>Sr</Text>
            <Text style={[styles.cellHeader, styles.colModel]}>Category</Text>
            <Text style={[styles.cellHeader, styles.colCity]}>Location</Text>
            <Text style={[styles.cellHeader, styles.colQty]}>Qty</Text>
            <Text style={[styles.cellHeader, styles.colPrice]}>Unit Price</Text>
            <Text style={[styles.cellHeader, styles.colTotal]}>Total</Text>
          </View>

          {(data.items || []).map((item: any, i: number) => {
            const total = item.qty * item.unitPrice

            return (
              <View style={styles.row} key={i}>
                <Text style={[styles.cell, styles.colSr]}>{i + 1}</Text>
                <Text style={[styles.cell, styles.colModel]}>{item.model}</Text>
                <Text style={[styles.cell, styles.colCity]}>{item.city}</Text>
                <Text style={[styles.cell, styles.colQty]}>{item.qty}</Text>

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

        <Text style={{ marginTop: 10 }}>
          Total ₹ {Number(data.total).toLocaleString("en-IN")}
        </Text>

        <Text>
          Amount in Words: Rupees {amountInWords(data.total)} Only
        </Text>

      </Page>
    </Document>
  )
}