import { renderToBuffer } from "@react-pdf/renderer"
import ProformaPDF from "./templates/ProformaPDF"

export async function generateProforma(data: any) {
  return await renderToBuffer(
    <ProformaPDF data={data} />
  )
}