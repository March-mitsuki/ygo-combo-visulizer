import { userModel } from "@server/db/models";
import { ModelRouterBuilder } from "@server/utils/api";

export const userRouter = new ModelRouterBuilder(userModel);
userRouter.enableAll();
