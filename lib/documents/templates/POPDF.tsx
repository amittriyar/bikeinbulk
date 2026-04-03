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
    marginTop: 10,
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

  cellHeader: {
    flex: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    padding: 4,
    fontWeight: "bold",
    backgroundColor: "#eee"
  },

  cell: {
    flex: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    padding: 4
  },

  total: {
    marginTop: 10,
    fontWeight: "bold"
  },

  rightAlign: {
    textAlign: "right",
    marginTop: 20
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

/* ===============================
   COMPONENT
=============================== */

export default function POPDF({ data }: any) {

  return (
    <Document>
      <Page style={styles.page}>

        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.logo}>GC</Text>
          <Text>GiftConnect Marketplace</Text>
        </View>

        <Text style={styles.title}>PURCHASE ORDER</Text>

        {/* META */}
        <View style={styles.section}>
          <Text>PO No {data.poNumber}</Text>
          <Text>RFQ Reference {data.rfqId}</Text>
          <Text>Date {data.date}</Text>
        </View>

        {/* BUYER SELLER TABLE */}
        <View style={styles.table}>
          <View style={styles.row}>
            <Text style={styles.cellHeader}>Buyer Details</Text>
            <Text style={styles.cellHeader}>Seller Details</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.cell}>{data.buyer.name}</Text>
            <Text style={styles.cell}>{data.seller.name}</Text>
          </View>
        </View>

        {/* ITEMS TABLE */}
        <View style={styles.table}>

          <View style={styles.row}>
            <Text style={styles.cellHeader}>Sr</Text>
            <Text style={styles.cellHeader}>Model</Text>
            <Text style={styles.cellHeader}>City</Text>
            <Text style={styles.cellHeader}>Qty</Text>
            <Text style={styles.cellHeader}>Unit Price (Ex-Showroom)</Text>
            <Text style={styles.cellHeader}>Total</Text>
          </View>

          {(data.items || []).map((item: any, i: number) => {

            const total = item.qty * item.unitPrice

            return (
              <View style={styles.row} key={i}>
                <Text style={styles.cell}>{i + 1}</Text>
                <Text style={styles.cell}>{item.model}</Text>
                <Text style={styles.cell}>{item.city}</Text>
                <Text style={styles.cell}>{item.qty}</Text>
                <Text style={styles.cell}>₹ {item.unitPrice}</Text>
                <Text style={styles.cell}>₹ {total}</Text>
              </View>
            )
          })}

        </View>

        {/* TOTAL */}
        <Text style={styles.total}>
          Total ₹ {Number(data.total).toLocaleString("en-IN")}
        </Text>

        <Text>
          Amount in Words: Rupees {amountInWords(data.total)} Only
        </Text>

        {/* TERMS */}
        <View style={styles.section}>
          <Text>Terms</Text>
          <Text>This Purchase Order constitutes a binding agreement between Buyer and Seller.</Text>
          <Text>Delivery timelines and commercial terms shall be as agreed in the quotation.</Text>
        </View>

        {/* TERMS & CONDITIONS */}
        <View style={styles.section}>
          <Text>Terms & Conditions</Text>

          <Text>1. This Purchase Order constitutes a binding agreement between Buyer and Seller.</Text>
          <Text>2. Prices are Ex-Showroom and inclusive of applicable GST unless specified otherwise.</Text>
          <Text>3. Additional charges such as RTO, insurance, accessories and handling shall be borne by the beneficiary.</Text>
          <Text>4. Delivery timelines shall be as agreed in the accepted quotation.</Text>
          <Text>5. Seller shall be responsible for vehicle availability, delivery and documentation.</Text>
          <Text>6. GiftConnect acts solely as a digital marketplace facilitator.</Text>
          <Text>7. Any disputes shall be subject to mutually agreed jurisdiction.</Text>
        </View>

        {/* SIGNATURE */}
        <View style={styles.rightAlign}>
          <Text>For {data.seller.name}</Text>
          <Text>Authorized Signatory</Text>
        </View>

        {/* FOOTER */}
        <Text style={styles.small}>
          Powered by GiftConnect – Enterprise Marketplace
        </Text>

      </Page>
    </Document>
  )
}