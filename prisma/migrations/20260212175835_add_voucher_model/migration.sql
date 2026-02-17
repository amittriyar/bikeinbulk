-- CreateTable
CREATE TABLE "Voucher" (
    "id" TEXT NOT NULL,
    "voucherId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "beneficiary" JSONB NOT NULL,
    "sellerId" TEXT NOT NULL,
    "voucherLanguage" JSONB,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "redeemedAt" TIMESTAMP(3),

    CONSTRAINT "Voucher_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Voucher_voucherId_key" ON "Voucher"("voucherId");