import { Google } from "arctic";

import { env } from "@/env";
import { db } from "../db";

export const google = new Google(env.GOOGLE_CLIENT_ID ?? "", env.GOOGLE_CLIENT_SECRET ?? "", env.NODE_ENV === "production" ? `https://timeslot.aornum.xyz/auth/google/callback` : "http://localhost:3000/auth/google/callback");

export const createGoogleUser = async (googleId: string, email: string, name: string, picture: string) => {
  const existingUser = await db.user.findUnique({
    where: {
      email: email,
    },
  });

  if (existingUser) {
    throw new Error("User already exists");
  }

  return await db.user.create({
    data: {
      email: email,
      displayName: name ?? "",
      image: picture,
      googleUser: {
        create: {
          googleId: googleId,
        },
      },
    },
  });
};

export const getUserByGoogleId = async (googleId: string) => {
  const googleUser = await db.googleUser.findUnique({
    where: {
      googleId: googleId,
    },
    include: {
      user: true,
    },
  });
  if (googleUser === null) {
    return null;
  }
  return googleUser.user;
};
