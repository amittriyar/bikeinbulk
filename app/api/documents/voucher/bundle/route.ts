import { NextResponse } from "next/server";
import JSZip from "jszip";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID required" },
        { status: 400 }
      );
    }

    // ✅ Dynamic base URL
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const host = req.headers.get("host");
    const baseUrl = `${protocol}://${host}`;

    // 🔥 Fetch vouchers
    const voucherRes = await fetch(
      `${baseUrl}/api/voucher/list?orderId=${orderId}`
    );

    if (!voucherRes.ok) {
      return NextResponse.json(
        { error: "Failed to fetch vouchers" },
        { status: 500 }
      );
    }

    const vouchers = await voucherRes.json();

    if (!vouchers || vouchers.length === 0) {
      return NextResponse.json(
        { error: "No vouchers found" },
        { status: 404 }
      );
    }

    const zip = new JSZip();

    // 🔥 Add PDFs
    for (const v of vouchers) {
      try {
        const pdfRes = await fetch(
          `${baseUrl}/api/documents/voucher/pdf?voucherId=${v.voucherId}`
        );

        if (!pdfRes.ok) continue;

        const pdfBuffer = await pdfRes.arrayBuffer();

        zip.file(`Voucher-${v.voucherId}.pdf`, pdfBuffer);

      } catch (err) {
        console.error("Skipping voucher:", v.voucherId);
      }
    }

    // ✅ Generate ZIP
    const zipData = await zip.generateAsync({ type: "uint8array" });

    // ✅ Convert safely
    const arrayBuffer = zipData.buffer.slice(
      zipData.byteOffset,
      zipData.byteOffset + zipData.byteLength
    );

    // ✅ FINAL FIX (TypeScript-safe cast)
    return new Response(arrayBuffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename=Vouchers-${orderId}.zip`,
      },
    });

  } catch (err) {
    console.error("ZIP ERROR:", err);
    return NextResponse.json(
      { error: "Failed to generate ZIP" },
      { status: 500 }
    );
  }
}