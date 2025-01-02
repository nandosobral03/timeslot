import { generateRandomString } from "@oslojs/crypto/random";
import { webcrypto } from "node:crypto";
import { protectedProcedure } from "../../trpc";

import type { RandomReader } from "@oslojs/crypto/random";

const random: RandomReader = {
  read(bytes: Uint8Array): void {
    webcrypto.getRandomValues(bytes);
  },
};

export const refreshAPIToken = protectedProcedure.mutation(async ({ ctx }) => {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_~";
  const newApiKey = generateRandomString(random, alphabet, 48);

  await ctx.db.user.update({
    where: { id: ctx.user.id },
    data: { extensionAPIKey: newApiKey },
  });

  return newApiKey;
});
