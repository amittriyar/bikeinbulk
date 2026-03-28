import { getDb } from "@/lib/db";
import * as XLSX from "xlsx";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const db = getDb();

  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return new Response("Missing orderId", { status: 400 });
    }

    /* ===============================
       FETCH ORDER
    =============================== */
    const order = await db.order.findUnique({
      where: { orderId }
    });

    if (!order) {
      return new Response("Order not found", { status: 404 });
    }

    const rawItems = (order.items ?? []) as any[];

    let rows: any[] = [];

    /* ===============================
       BUILD EXCEL ROWS
       ✅ ALIGNED WITH PO LOGIC
    =============================== */
    rawItems.forEach((model: any) => {
      const modelName = model?.modelName || model?.model || "Unknown Model";

      const locations = Array.isArray(model?.locations)
        ? model.locations
        : [];

      locations.forEach((loc: any) => {
        const city = loc?.city || "";
        const qty = Number(loc?.qty ?? 0);

        // ✅ EXACT SAME LOGIC AS PO + POPUP
        const unitPrice = Number(
          loc?.quotedPrice ?? loc?.unitPrice ?? 0
        );

        // 🔍 DEBUG (remove later)
        console.log("TEMPLATE LOC:", loc, "PRICE:", unitPrice);

        // ✅ Create one row per beneficiary
        for (let i = 0; i < qty; i++) {
          rows.push({
            Order_ID: orderId,
            Model: modelName,
            City: city,
            UnitPrice: unitPrice, // ✅ FIXED HERE
            Name: "",
            Mobile: "",
            Email: "",
            Pincode: ""
          });
        }
      });
    });

    /* ===============================
       HANDLE EMPTY CASE
    =============================== */
    if (rows.length === 0) {
      rows.push({
        Order_ID: orderId,
        Model: "",
        City: "",
        UnitPrice: "",
        Name: "",
        Mobile: "",
        Email: "",
        Pincode: ""
      });
    }

    /* ===============================
       CREATE SHEET
    =============================== */
    const worksheet = XLSX.utils.json_to_sheet(rows, {
      header: [
        "Order_ID",
        "Model",
        "City",
        "UnitPrice",
        "Name",
        "Mobile",
        "Email",
        "Pincode"
      ]
    });

    /* ===============================
       COLUMN WIDTH
    =============================== */
    worksheet["!cols"] = [
      { wch: 18 },
      { wch: 25 },
      { wch: 18 },
      { wch: 15 },
      { wch: 25 },
      { wch: 18 },
      { wch: 25 },
      { wch: 15 }
    ];

    /* ===============================
       WORKBOOK
    =============================== */
    const range = XLSX.utils.decode_range(worksheet["!ref"] || "");

    // 🔒 Lock UnitPrice column (Column D = index 3)
    for (let R = range.s.r + 1; R <= range.e.r; ++R) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: 3 });

      if (!worksheet[cellAddress]) continue;

      worksheet[cellAddress].s = {
        protection: { locked: true }
      };
    }

        // 📦 Now create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Beneficiaries");

    // 📥 Write file
    const buffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx"
    });
    /* ===============================
       RESPONSE
    =============================== */
    return new Response(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename=beneficiaries-${orderId}.xlsx`
      }
    });

  } catch (error: any) {
    console.error("Template error:", error);

    return new Response("Failed to generate template", {
      status: 500
    });
  }
}