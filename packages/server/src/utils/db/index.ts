import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();
export const initPrisma = () => {
  // eslint-disable-next-line
  // @ts-ignore
  if (!process.app) process.app = {};
  process.app.prisma = prisma;
};
