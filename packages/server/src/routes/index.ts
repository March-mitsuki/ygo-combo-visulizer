import type { Express } from "express";
import { userRouter } from "./user";
import { postRouter } from "./post";
import { profileRouter } from "./profile";

export const initRouter = (app: Express) => {
  app.use(userRouter.build());
  app.use(postRouter.build());
  app.use(profileRouter.build());
};
