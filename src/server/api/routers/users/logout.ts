import { cookies } from "next/headers";
import { protectedProcedure } from "../../trpc";

export const logout = protectedProcedure.mutation(async () => {
  (await cookies()).delete("session");
});
