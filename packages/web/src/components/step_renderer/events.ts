import { Step } from "@web/interfaces";
import mitt from "mitt";

export type StepEvents = {
  "req-add-step": Step;
  "add-step-done": void;

  "req-add-condition": Step;
  "add-condition-done": void;

  "req-edit-step": Step;
  "edit-step-done": void;
};
export const stepEvents = mitt<StepEvents>();
