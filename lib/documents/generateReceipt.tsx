import { renderToBuffer } from "@react-pdf/renderer"
import ReceiptPDF from "./templates/ReceiptPDF"

export async function generateReceipt(data: any) {
  return await renderToBuffer(
    <ReceiptPDF data={data} />
  )
}