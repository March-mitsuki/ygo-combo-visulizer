import { Steps, GameFactory, CardDeck, FinalField } from "@web/interfaces";

const steps = new Steps({
  name: "双子一卡",
  cardDeck: { id: 1, name: "双子" },
  finalField: { id: 1, cardDeckId: 1, name: "死镰封锁" },
  data: [
    GameFactory.step({
      id: 1,
      state: {
        hand: "小红",
      },
      nextStepAction: "通召小红",
      nextStepId: 2,
    }),
    GameFactory.step({
      id: 2,
      state: {
        field: {
          front: "小红",
          back: "",
          exLeft: "",
          exRight: "",
          fieldSpell: "",
        },
      },
      nextStepAction: "小红落地叫效特招卡组小蓝",
      nextStepId: 3,
      conditions: [
        { condition: "吃灰", nextStepId: 5 },
        { condition: "吃幽鬼兔", nextStepId: 7 },
        { condition: "吃泡", nextStepId: 9 },
      ],
    }),
    GameFactory.step({
      id: 3,
      state: {
        field: {
          front: "小红, 小蓝",
          back: "",
          exLeft: "",
          exRight: "",
          fieldSpell: "",
        },
      },
      nextStepAction: "小红变L1大红",
      nextStepId: 4,
    }),
    GameFactory.step({
      id: 4,
      state: {
        field: {
          front: "小蓝",
          back: "",
          exLeft: "L1大红",
          exRight: "",
          fieldSpell: "",
        },
      },
      nextStepAction: "L1大红效果从卡组堆墓新小蓝",
      nextStepId: 10,
    }),
    GameFactory.step({
      id: 5,
      state: {
        field: {
          front: "小红",
          back: "",
          exLeft: "",
          exRight: "",
          fieldSpell: "",
        },
      },
      nextStepAction: "吃灰后直接小红变L1大红",
      nextStepId: 6,
    }),
    GameFactory.step({
      id: 6,
      state: {
        field: {
          front: "小蓝",
          exLeft: "L1大红",
          back: "",
          exRight: "",
          fieldSpell: "",
        },
      },
      nextStepAction: "L1大红效果从卡组堆墓新小蓝",
    }),
    GameFactory.step({
      id: 7,
      state: {
        field: {
          front: "",
          back: "",
          exLeft: "",
          exRight: "",
          fieldSpell: "",
        },
      },
      nextStepAction: "吃幽鬼兔效果通过从卡组特招小蓝",
      nextStepId: 8,
    }),
    GameFactory.step({
      id: 8,
      state: {
        field: {
          front: "小蓝",
          back: "",
          exLeft: "",
          exRight: "",
          fieldSpell: "",
        },
      },
      nextStepAction: "小蓝落地叫效特招卡组小红",
    }),
    GameFactory.step({
      id: 9,
      state: {
        field: {
          front: "小红",
          back: "",
          exLeft: "",
          exRight: "",
          fieldSpell: "",
        },
      },
      nextStepAction: "吃泡后直接小红变L1大红",
    }),
    GameFactory.step({
      id: 10,
      state: {
        field: {
          front: "小蓝",
          back: "",
          exLeft: "",
          exRight: "",
          fieldSpell: "",
        },
        graveyard: "新小蓝",
      },
      nextStepAction: "新小蓝墓地叫效特招自己",
      conditions: [{ condition: "吃渊兽", nextStepId: 11 }],
    }),
    GameFactory.step({
      id: 11,
      state: {
        field: {
          front: "小蓝",
          back: "",
          exLeft: "",
          exRight: "",
          fieldSpell: "",
        },
        banished: "新小蓝",
      },
      nextStepAction: "L1大红变L1棺材",
    }),
  ],
});

class Store {
  cardDeckList: CardDeck[] = [];
  finalFieldList: FinalField[] = [];
  stepsList: Steps[] = [];
  currentStepsId: number | undefined;

  addCardDeck(deck: CardDeck) {
    this.cardDeckList.push(deck);
  }

  addFinalField(finalField: FinalField) {
    this.finalFieldList.push(finalField);
  }

  addSteps(steps: Steps) {
    this.stepsList.push(steps);
  }

  getDeckById(id: number) {
    return this.cardDeckList.find((deck) => deck.id === id);
  }

  getFinalFieldById(id: number) {
    return this.finalFieldList.find((finalField) => finalField.id === id);
  }

  getStepsById(id: number) {
    return this.stepsList.find((steps) => steps.id === id);
  }

  getDeckFinalFields(deckId: number) {
    return this.finalFieldList.filter(
      (finalField) => finalField.cardDeckId === deckId,
    );
  }

  getFinalFieldSteps(finalFieldId: number) {
    return this.stepsList.filter(
      (steps) => steps.finalField.id === finalFieldId,
    );
  }

  setCurrentStepsId(id: number) {
    this.currentStepsId = id;
  }

  getCurrentSteps() {
    if (!this.currentStepsId) {
      return;
    }
    return this.getStepsById(this.currentStepsId);
  }
}

export const store = new Store();
