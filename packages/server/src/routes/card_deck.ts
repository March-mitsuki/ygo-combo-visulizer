import { cardDeckModel } from "@server/db/models";
import { ModelRouterBuilder } from "@server/utils/api";

export const cardDeckRouter = new ModelRouterBuilder(cardDeckModel);
cardDeckRouter.enableAll();
