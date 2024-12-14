import { publicProcedure } from "@/server/api/trpc";

export const list = publicProcedure.query(({ ctx }) => ctx.db.tag.findMany());
