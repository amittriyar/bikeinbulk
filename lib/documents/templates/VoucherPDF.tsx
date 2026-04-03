import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image
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

  box: {
    borderWidth: 1,
    borderStyle: "dashed",
    padding: 15,
    marginTop: 10
  },

  section: { marginTop: 10 },

  amount: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10
  },

  qr: {
    marginTop: 10,
    alignItems: "flex-end"
  }
})

export default function VoucherPDF({ data }: any) {
  return (
    <Document>
      <Page style={styles.page}>

        <View style={styles.header}>
          <Text style={styles.logo}>GC</Text>
          <Text>GiftConnect Marketplace</Text>
        </View>

        <Text style={styles.title}>GIFT VOUCHER</Text>

        <View style={styles.box}>

          <Text>Voucher Code: {data.voucherId}</Text>
          <Text>Date: {data.date}</Text>

          <Text style={styles.amount}>
            ₹ {Math.round(data.amount).toLocaleString("en-IN")}
          </Text>

          <View style={styles.section}>
            <Text>Issued To: {data.beneficiary?.name}</Text>
            <Text>Mobile: {data.beneficiary?.mobile}</Text>
          </View>

          <View style={styles.section}>
            <Text>Corporate Buyer: {data.buyerName}</Text>
          </View>

          <View style={styles.section}>
            <Text>Redeemable At:</Text>
            <Text>{data.reseller?.companyName || "Dealer to be assigned"}</Text>
            <Text>
              {data.reseller?.city} {data.reseller?.state}
            </Text>
          </View>

          <View style={styles.section}>
            <Text>Valid Till: {data.expiryDate}</Text>
          </View>

          <View style={styles.section}>
            <Text>Status: {data.status}</Text>
          </View>

          <View style={styles.qr}>
            <Image src={data.qrImage} style={{ width: 80, height: 80 }} />
            <Text>Scan for Redemption</Text>
          </View>

        </View>

      </Page>
    </Document>
  )
}