import { createOrderFromRFQ } from "@/lib/services/orderService"

export async function POST(req: Request) {

  try {
    const body = await req.json()

    const { rfqId, buyerId } = body

    const order = await createOrderFromRFQ(rfqId, buyerId)

    return Response.json(order)

  } catch (e) {
    console.error("Order error:", e)
    return new Response("Error creating order", { status: 500 })
  }
}