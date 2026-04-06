import * as XLSX from "xlsx"

/* ================= CSV EXPORT ================= */
export function exportToCSV(data: any[], filename: string) {
  if (!data || data.length === 0) return

  const headers = Object.keys(data[0])
  const rows = data.map(obj =>
    headers.map(h => `"${obj[h] ?? ""}"`).join(",")
  )

  const csv = [headers.join(","), ...rows].join("\n")

  const blob = new Blob([csv], { type: "text/csv" })
  const url = window.URL.createObjectURL(blob)

  const a = document.createElement("a")
  a.href = url
  a.download = `${filename}.csv`
  a.click()
}

/* ================= EXCEL EXPORT ================= */
export function exportToExcel(data: any[], filename: string) {
  if (!data || data.length === 0) return

  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1")

  XLSX.writeFile(workbook, `${filename}.xlsx`)
}