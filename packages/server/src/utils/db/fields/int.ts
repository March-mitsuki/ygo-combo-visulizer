import { z } from "zod";
import { Field, FieldInit, ValidationOptions } from "./common";

export interface IntFieldValidationOptions extends ValidationOptions {
  gt?: number;
  gte?: number;
  lt?: number;
  lte?: number;
  positive?: boolean;
  nonnegative?: boolean;
  negative?: boolean;
  nonpositive?: boolean;
  multipleOf?: number;
}
export interface IntFieldInit extends Omit<FieldInit, "type"> {
  validationOptions?: IntFieldValidationOptions;
}
export class IntField extends Field<number> {
  readonly validationOptions: IntFieldValidationOptions;

  constructor(init: IntFieldInit) {
    super({ ...init, type: "Int" });
    this.validationOptions = init.validationOptions || {};
  }

  _buildValidator(coerce?: boolean) {
    let v: z.ZodNumber;
    if (coerce) {
      v = z.coerce.number().int().safe();
    } else {
      v = z.number().int().safe();
    }

    if (this.validationOptions.gt) {
      v = v.gt(this.validationOptions.gt);
    }
    if (this.validationOptions.gte) {
      v = v.gte(this.validationOptions.gte);
    }
    if (this.validationOptions.lt) {
      v = v.lt(this.validationOptions.lt);
    }
    if (this.validationOptions.lte) {
      v = v.lte(this.validationOptions.lte);
    }
    if (this.validationOptions.positive) {
      v = v.positive();
    }
    if (this.validationOptions.nonnegative) {
      v = v.nonnegative();
    }
    if (this.validationOptions.negative) {
      v = v.negative();
    }
    if (this.validationOptions.nonpositive) {
      v = v.nonpositive();
    }
    if (this.validationOptions.multipleOf) {
      v = v.multipleOf(this.validationOptions.multipleOf);
    }

    return v;
  }
}
