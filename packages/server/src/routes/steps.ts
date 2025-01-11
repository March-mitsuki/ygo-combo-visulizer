import { stepsModel } from "@server/db/models";
import { ModelRouterBuilder } from "@server/utils/api";
import { GetUserStepsEndpoint, ResponseCode } from "@qupidjs/types/api";

export const stepsRouter = new ModelRouterBuilder(stepsModel);
stepsRouter.enableAll();

stepsRouter.add<GetUserStepsEndpoint>("GET", "/user-steps", async (req) => {
  const user = { id: 1 };

  const cardDeckList = await process.app.prisma.cardDeck.findMany({
    where: {
      userId: user.id,
    },
  });
  const finalFieldList = await process.app.prisma.finalField.findMany({
    where: {
      cardDeckId: {
        in: cardDeckList.map((cardDeck) => cardDeck.id),
      },
    },
  });
  const stepsList = await process.app.prisma.steps.findMany({
    where: {
      finalFieldId: {
        in: finalFieldList.map((finalField) => finalField.id),
      },
    },
  });

  return {
    data: {
      stepsList: stepsList,
      cardDeckList: cardDeckList,
      finalFieldList: finalFieldList,
    },
    code: ResponseCode.Success,
  };
});
