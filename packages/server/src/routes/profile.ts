import { profileModel } from "@server/db/models";
import { ModelRouterBuilder } from "@server/utils/api";

export const profileRouter = new ModelRouterBuilder(profileModel);
profileRouter.enableAll();
