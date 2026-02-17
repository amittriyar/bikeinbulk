ALTER TABLE "Voucher"
ADD COLUMN     "expiryDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "mappedResellerId" TEXT NOT NULL,
ADD COLUMN     "paymentStatus" TEXT NOT NULL,
ADD COLUMN     "value" DOUBLE PRECISION NOT NULL;

-- CreateTable
CREATE TABLE "Reseller" (
    "id" TEXT NOT NULL,
    "resellerCode" TEXT NOT NULL,
    "oemName" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "contactName" TEXT,
    "mobile" TEXT,
    "email" TEXT,
    "city" TEXT,
    "state" TEXT,
    "pincode" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reseller_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Reseller_resellerCode_key" ON "Reseller"("resellerCode");

-- AddForeignKey
ALTER TABLE "Voucher" ADD CONSTRAINT "Voucher_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "Beneficiary"("beneficiaryId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Voucher" ADD CONSTRAINT "Voucher_mappedResellerId_fkey" FOREIGN KEY ("mappedResellerId") REFERENCES "Reseller"("resellerCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Voucher" ADD CONSTRAINT "Voucher_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("orderId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderBeneficiary" ADD CONSTRAINT "OrderBeneficiary_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "Beneficiary"("beneficiaryId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderBeneficiary" ADD CONSTRAINT "OrderBeneficiary_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("orderId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderBeneficiary" ADD CONSTRAINT "OrderBeneficiary_mappedResellerId_fkey" FOREIGN KEY ("mappedResellerId") REFERENCES "Reseller"("resellerCode") ON DELETE SET NULL ON UPDATE CASCADE;