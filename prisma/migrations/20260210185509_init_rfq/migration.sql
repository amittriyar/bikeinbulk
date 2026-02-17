-- CreateTable
CREATE TABLE "RFQ" (
    "id" TEXT NOT NULL,
    "rfqId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "rfqType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "items" JSONB NOT NULL,
    "bids" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RFQ_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RFQ_rfqId_key" ON "RFQ"("rfqId");