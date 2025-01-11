import type { Express } from "express";
import { userRouter } from "./user";
import { finalFieldRouter } from "./final_field";
import { cardDeckRouter } from "./card_deck";
import { stepsRouter } from "./steps";

export const initRouter = (app: Express) => {
  app.use(userRouter.build());
  app.use(finalFieldRouter.build());
  app.use(cardDeckRouter.build());
  app.use(stepsRouter.build());
};
