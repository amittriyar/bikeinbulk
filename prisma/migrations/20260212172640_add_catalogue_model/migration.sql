-- CreateTable
CREATE TABLE "Catalogue" (
    "id" TEXT NOT NULL,
    "oemName" TEXT NOT NULL,
    "modelName" TEXT NOT NULL,
    "category" TEXT,
    "fuelType" TEXT,
    "engineCapacity" TEXT,
    "exShowroomPrice" DOUBLE PRECISION NOT NULL,
    "moq" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Catalogue_pkey" PRIMARY KEY ("id")
);