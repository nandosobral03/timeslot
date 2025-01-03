import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";
import { env } from "@/env";

let adapter: PrismaLibSQL;

if (env.NODE_ENV === "production") {
  const libsql = createClient({
    url: `${env.TURSO_DATABASE_URL}`,
    authToken: `${env.TURSO_AUTH_TOKEN}`,
  });
  adapter = new PrismaLibSQL(libsql);
}

const createPrismaClient = () => {
  return env.NODE_ENV === "production"
    ? new PrismaClient({ adapter })
    : new PrismaClient({
        log: env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
      });
};

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;
