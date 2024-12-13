import argon2 from "argon2";

const params = {
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
};

export const hashPassword = async (password: string) =>
  argon2.hash(password, params);

export const validatePassword = async (original: string, password: string) =>
  argon2.verify(original, password);
