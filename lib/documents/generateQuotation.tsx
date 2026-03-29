import { renderToBuffer } from "@react-pdf/renderer"
import QuotationPDF from "./templates/QuotationPDF"

export async function generateQuotation(data: any) {
  return await renderToBuffer(
    <QuotationPDF data={data} />
  )
}