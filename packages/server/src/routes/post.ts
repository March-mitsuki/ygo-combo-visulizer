import { postModel } from "@server/db/models";
import { ModelRouterBuilder } from "@server/utils/api";

export const postRouter = new ModelRouterBuilder(postModel);
postRouter.enableAll();
