import { renderToBuffer } from "@react-pdf/renderer"
import VoucherPDF from "./templates/VoucherPDF"

export async function generateVoucher(data: any) {
  return await renderToBuffer(
    <VoucherPDF data={data} />
  )
}