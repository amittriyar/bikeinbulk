/*
  Warnings:

  - You are about to drop the column `data` on the `Order` table. All the data in the column will be lost.
  - Made the column `status` on table `Order` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "data",
ADD COLUMN     "bidId" TEXT,
ADD COLUMN     "deliveryTimeline" TEXT,
ADD COLUMN     "items" JSONB,
ADD COLUMN     "moq" INTEGER,
ADD COLUMN     "orderValue" DOUBLE PRECISION,
ADD COLUMN     "sellerName" TEXT,
ADD COLUMN     "totalQty" INTEGER,
ADD COLUMN     "unitPrice" DOUBLE PRECISION,
ADD COLUMN     "validityDays" INTEGER,
ALTER COLUMN "status" SET NOT NULL;