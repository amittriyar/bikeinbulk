import { renderToBuffer } from "@react-pdf/renderer"
import POPDF from "./templates/POPDF"

export async function generatePO(data: any) {
  return await renderToBuffer(
    <POPDF data={data} />
  )
}