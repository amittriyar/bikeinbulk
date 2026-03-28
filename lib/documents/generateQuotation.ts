import puppeteer from "puppeteer"
import { quotationHTML } from "./quotationTemplate"

export async function generateQuotation(data: any) {

  const browser = await puppeteer.launch({
    headless: true
  })

  const page = await browser.newPage()

  const html = quotationHTML(data)

  await page.setContent(html, {
    waitUntil: "domcontentloaded"
  })

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true
  })

  await browser.close()

  return pdfBuffer
}