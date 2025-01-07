import { z } from "zod";

import { Model } from "../model";
import { Field, FieldInit } from "./common";

export interface RelationFieldInit
  extends Pick<
    FieldInit,
    "name" | "isList" | "nullable" | "validationOptions"
  > {
  model: () => Model;
  fields?: Field[];
  references?: string[];
}
export class RelationField extends Field {
  readonly model: () => Model;
  readonly fields: Field[];
  readonly references: string[];

  constructor({
    model,
    fields = [],
    references = [],
    ...rest
  }: RelationFieldInit) {
    super({ ...rest, type: "Relation" });
    this.model = model;
    this.fields = fields;
    this.references = references;
  }

  _buildValidator(coerce?: boolean) {
    if (coerce) {
      console.warn("Coercion is not supported for relation fields");
    }

    let v = this.model().schema.extend({
      id: z.number().safe(),
    }) as any; // eslint-disable-line @typescript-eslint/no-explicit-any

    if (this.isList) {
      v = z.array(v);
    }
    if (this.validationOptions?.optional) {
      v = v.optional();
    }

    return v as z.ZodType;
  }
}
