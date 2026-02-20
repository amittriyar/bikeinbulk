import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

let prisma: PrismaClient;

export function getDb() {
  if (!prisma) {
    prisma = new PrismaClient({
      adapter: new PrismaPg(
        new Pool({
          connectionString: process.env.DATABASE_URL!,
          max: 10,
        })
      ),
    });
  }

  return prisma;
}
