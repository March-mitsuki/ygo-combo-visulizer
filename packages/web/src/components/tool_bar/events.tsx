import { CardDeck, FinalField, Steps } from "@web/interfaces";
import mitt from "mitt";

export type StepEvents = {
  "open-steps-selector": void;

  "req-add-card-deck": void;
  "add-card-deck-done": void;

  "req-add-final-field": CardDeck;
  "add-final-field-done": void;

  "req-add-steps": FinalField;
  "add-steps-done": void;

  "select-steps": Steps;

  "back-to-origin": void;
};
export const toolBarEvents = mitt<StepEvents>();
