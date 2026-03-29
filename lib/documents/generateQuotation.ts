import { generatePDF } from "@/lib/documents/generatePDF"
import { quotationHTML } from "@/lib/documents/quotationTemplate"

export async function generateQuotation(data: any) {
  const html = quotationHTML(data)
  return await generatePDF(html)
}