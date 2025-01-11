import { finalFieldModel } from "@server/db/models";
import { ModelRouterBuilder } from "@server/utils/api";

export const finalFieldRouter = new ModelRouterBuilder(finalFieldModel);
finalFieldRouter.enableAll();
