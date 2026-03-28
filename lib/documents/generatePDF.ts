import puppeteer from "puppeteer"

export async function generatePDF(html: string) {

  const browser = await puppeteer.launch({
    headless: true
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