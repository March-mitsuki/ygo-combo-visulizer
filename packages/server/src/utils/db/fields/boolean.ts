import { z } from "zod";
import { Field, FieldInit } from "./common";

export type BooleanFieldInit = Omit<FieldInit, "type">;
export class BooleanField extends Field<boolean> {
  constructor(init: BooleanFieldInit) {
    super({ ...init, type: "Boolean" });
  }

  _buildValidator(coerce?: boolean) {
    if (coerce) {
      return z.coerce.boolean();
    }
    return z.boolean();
  }
}
