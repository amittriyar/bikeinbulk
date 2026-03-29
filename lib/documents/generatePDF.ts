import puppeteer from "puppeteer-core"
import chromium from "@sparticuz/chromium"

export async function generatePDF(html: string) {

  const isProd = process.env.NODE_ENV === "production"

  const browser = await puppeteer.launch({
    args: isProd ? chromium.args : [],
    executablePath: isProd
      ? await chromium.executablePath()
      : undefined,
    headless: true,
  })

  const page = await browser.newPage()

  await page.setContent(html, {
    waitUntil: "domcontentloaded"
  })

  const pdf = await page.pdf({
    format: "A4",
    printBackground: true
  })

  await browser.close()

  return pdf
}