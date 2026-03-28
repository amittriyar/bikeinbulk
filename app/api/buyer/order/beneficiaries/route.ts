import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import * as XLSX from "xlsx";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ================= GET ================= */

export async function GET(req: Request) {
  const db = getDb();

  try {
    const { searchParams } = new URL(req.url);
    const buyerId = searchParams.get("buyerId");

    if (!buyerId) {
      return NextResponse.json([]);
    }

    // ✅ STEP 1: Get all orders of buyer
    const orders = await db.order.findMany({
      where: { buyerId },
      select: { orderId: true }
    });

    const orderIds = orders.map(o => o.orderId);

    if (orderIds.length === 0) {
      return NextResponse.json([]);
    }

    // ✅ STEP 2: Fetch beneficiaries using orderIds
    const data = await db.orderBeneficiary.findMany({
      where: {
        orderId: { in: orderIds }
      },
      include: {
        beneficiary: true,
        reseller: true
      }
    });

    return NextResponse.json(data);

  } catch (err: any) {
    console.error("GET ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/* ================= POST ================= */

export async function POST(req: Request) {
  const db = getDb();

  try {
    const contentType = req.headers.get("content-type") || "";

    /* =========================================================
       🟢 MODE 1: EXCEL UPLOAD (multipart/form-data)
    ========================================================= */
    if (contentType.includes("multipart/form-data")) {

      const formData = await req.formData();
      const file = formData.get("file") as File;
      const orderId = formData.get("orderId") as string;

      if (!file || !orderId) {
        return NextResponse.json(
          { error: "Missing file or orderId" },
          { status: 400 }
        );
      }

      const order = await db.order.findUnique({
        where: { orderId }
      });

      if (!order) {
        return NextResponse.json(
          { error: "Order not found" },
          { status: 404 }
        );
      }

      // ✅ STEP 3 FIX HERE
      const sellerId = order.sellerId || "UNKNOWN";

      // 📥 Read Excel
      const buffer = Buffer.from(await file.arrayBuffer());
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data: any[] = XLSX.utils.sheet_to_json(sheet);

      let success = 0;
      let errors: any[] = [];

      const normalize = (obj: any, key: string) => {
        const clean = (str: string) =>
          str.toLowerCase().replace(/[\s_]/g, ""); // ✅ removes spaces + underscores

        const target = clean(key);

        const aliases: any = {
          name: ["name", "customername", "beneficiaryname"],
          mobile: ["mobile", "mobileno", "phone", "phonenumber"],
          email: ["email", "mail"],
          city: ["city", "location"],
          pincode: ["pincode", "pin", "zipcode"],
          model: ["model", "modelname"],
          orderid: ["orderid", "order_id"],
          unitprice: ["unitprice", "unit_price"]
        };

        const possibleKeys = aliases[target] || [target];

        const k = Object.keys(obj).find(x =>
          possibleKeys.includes(clean(x))
        );

        return k ? obj[k] : null;
      };

      for (let i = 0; i < data.length; i++) {

        const row = data[i];
        console.log("RAW ROW:", row);   // ✅ ADD
        try {
          const nameRaw = normalize(row, "Name");
          const mobileRaw = normalize(row, "Mobile");

          const name = nameRaw ? String(nameRaw).trim() : null;
          const mobile = mobileRaw ? String(mobileRaw).trim() : null;

          const email = normalize(row, "Email");
          const city = (normalize(row, "City") || "").trim();
          const pincodeRaw = normalize(row, "Pincode");
          const pincode = pincodeRaw ? String(pincodeRaw).trim() : null;

          console.log("PARSED:", { name, mobile, city, pincode }); // ✅ ADD

          if (!name || !mobile) {
            console.log("❌ VALIDATION FAILED:", { name, mobile, row });

            errors.push({ row: i + 2, error: "Missing name/mobile" });
            continue;
          }
          // ✅ Create Beneficiary
          const beneficiary = await db.beneficiary.create({
            data: {
              beneficiaryId: `BEN-${Date.now()}-${i}`,
              name,
              mobile: String(mobile),
              email,
              city,
              pincode: pincode ? String(pincode) : null
            }
          });

          // ✅ Find reseller
          let reseller = null;
          if (pincode) {
            reseller = await db.reseller.findFirst({
              where: {
                pincode: String(pincode),
                status: "Active"
              }
            });
          }
          // ✅ Mapping
          const modelName = normalize(row, "Model");

          await db.orderBeneficiary.create({
            data: {
              orderId,
              sellerId,
              beneficiaryId: beneficiary.beneficiaryId,

              // ✅ ADD THESE TWO LINES
              modelName: modelName || null,
              city: city || null,

              voucherStatus: reseller ? "MAPPED" : "NO_RESELLER",
              mappedResellerId: reseller ? reseller.resellerCode : null
            }
          });

          success++;

        } catch (err: any) {
          console.error("❌ ROW ERROR:", err);
          console.error("❌ FAILED ROW:", row);

          errors.push({
            row: i + 2,
            error: err.message || "Unknown error"
          });
        }
      }

      return NextResponse.json({
        mode: "excel",
        success,
        failed: errors.length,
        errors
      });
    }

    /* =========================================================
       🟢 MODE 2: MANUAL ENTRY (JSON)
    ========================================================= */

    const body = await req.json();

    if (!body.orderId) {
      return NextResponse.json(
        { error: "Missing orderId" },
        { status: 400 }
      );
    }

    const order = await db.order.findUnique({
      where: { orderId: body.orderId }
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    const sellerId = order.sellerId;

    // ✅ Create Beneficiary
    const beneficiary = await db.beneficiary.create({
      data: {
        beneficiaryId: `BEN-${Date.now()}`,
        name: body.name,
        mobile: String(body.mobile),
        email: body.email,
        city: body.city,
        pincode: body.pincode
      }
    });

    // ✅ Find reseller
    let reseller = await db.reseller.findFirst({
      where: {
        pincode: body.pincode,
        status: "Active"
      }
    });

    // ✅ Mapping
    await db.orderBeneficiary.create({
      data: {
        orderId: body.orderId,
        sellerId,
        beneficiaryId: beneficiary.beneficiaryId,
        voucherStatus: reseller ? "MAPPED" : "NO_RESELLER",
        mappedResellerId: reseller ? reseller.resellerCode : null
      }
    });

    return NextResponse.json({
      mode: "manual",
      success: true
    });

  } catch (err: any) {
    console.error("POST ERROR:", err);

    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}