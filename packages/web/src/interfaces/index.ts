// export type Card = {
//   name: string;
// };

export type Field = {
  front: string;
  back: string;
  exLeft: string;
  exRight: string;
  fieldSpell: string;
};

export type Graveyard = string;

export type Hand = string;

// 游戏开始后的卡组
export type Deck = string;

export type Banished = string;

export type State = {
  field: Field;
  graveyard: Graveyard;
  hand: Hand;
  deck: Deck;
  banished: Banished;
};

export type ConditionStep = {
  condition: string;
  nextStepId?: number;
};

export type Step = {
  id: number;
  state: State;
  nextStepAction?: string;
  nextStepId?: number;
  conditions: ConditionStep[];
};

export type NewStepParams = Partial<Omit<Step, "state">> & {
  state?: Partial<State>;
};
export class GameFactory {
  static step({
    id,
    state,
    nextStepAction,
    nextStepId,
    conditions,
  }: NewStepParams = {}): Step {
    return {
      id: id || Date.now(),
      state: {
        field: {
          front: "",
          back: "",
          exLeft: "",
          exRight: "",
          fieldSpell: "",
        },
        graveyard: "",
        hand: "",
        deck: "",
        banished: "",
        ...state,
      },
      nextStepAction,
      nextStepId,
      conditions: conditions || [],
    };
  }
}

// 游戏开始前的卡组
export type CardDeck = {
  id: number;
  name: string;
};
export type FinalField = {
  id: number;
  cardDeckId: number;
  name: string;
};
export class BuildFactory {
  static cardDeck(name: string): CardDeck {
    return {
      id: Date.now(),
      name,
    };
  }

  static finalField({ cardDeckId, name }: Omit<FinalField, "id">): FinalField {
    return {
      id: Date.now(),
      cardDeckId,
      name,
    };
  }
}

export type StepList = {
  idx: number;
  list: Step[] | null;
  prevStep?: Step;
};
export type HeadStep = {
  idx: number;
  step: Step | null;
  prevStep?: Step;
};
export type StepsInit = {
  id?: number;
  name: string;
  cardDeck: CardDeck;
  finalField: FinalField;
  data: Step[];
};
export class Steps {
  id: number;
  name: string;
  cardDeck: CardDeck;
  finalField: FinalField;
  data: Step[] = [];

  constructor({ name, id, cardDeck, finalField, data }: StepsInit) {
    if (data.length < 1) {
      throw new Error("Data must have at least one step");
    }
    this.id = id ?? Date.now();
    this.name = name;
    this.cardDeck = cardDeck;
    this.finalField = finalField;
    this.data = data;
  }

  /**
   * Shortcut to get the first step.
   */
  get firstStep() {
    return this.data[0];
  }

  toSaveJSON() {
    return {
      id: this.id,
      name: this.name,
      cardDeckId: this.cardDeck.id,
      finalFieldId: this.finalField.id,
      data: JSON.stringify(this.data),
    };
  }

  getStepById(id: number) {
    return this.data.find((step) => step.id === id);
  }

  getNext(step: Step): undefined | Step {
    if (!step.nextStepId) {
      return;
    }
    return this.getStepById(step.nextStepId);
  }

  toList(step: Step) {
    const list = [step];

    let next = this.getNext(step);
    while (next) {
      list.push(next);
      next = this.getNext(next);
    }

    return list;
  }

  toLists() {
    const mainList = this.toList(this.firstStep);
    const lists: StepList[] = [];

    const heads: HeadStep[] = [{ idx: 0, step: this.firstStep }];
    for (let i = 1; i < mainList.length; i++) {
      const step = mainList[i];
      if (step.conditions.length > 0) {
        step.conditions.forEach((condition) => {
          if (!condition.nextStepId) {
            heads.push({ idx: i, step: null, prevStep: step });
            return;
          }
          const nextStep = this.getStepById(condition.nextStepId);
          if (!nextStep) {
            throw new Error(
              `Step with id ${condition.nextStepId} not found in steps`,
            );
          }
          heads.push({ idx: i, step: nextStep });
        });
      }
    }

    for (const head of heads) {
      lists.push({
        idx: head.idx,
        list: head.step === null ? null : this.toList(head.step),
        prevStep: head.step === null ? head.prevStep : undefined,
      });
    }

    return lists;
  }

  getFlatConditions() {
    const conditions: ConditionStep[] = [];
    this.data.forEach((step) => {
      step.conditions.forEach((condition) => {
        conditions.push(condition);
      });
    });
    return conditions;
  }

  addStep(parent: Step, step: Step) {
    parent.nextStepId = step.id;
    this.data.push(step);
  }
}
