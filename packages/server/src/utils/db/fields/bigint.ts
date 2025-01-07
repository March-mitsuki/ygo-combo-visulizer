import { z } from "zod";
import { Field, FieldInit, ValidationOptions } from "./common";

export interface BigIntFieldValidationOptions extends ValidationOptions {
  gt?: bigint;
  gte?: bigint;
  lt?: bigint;
  lte?: bigint;
  positive?: boolean;
  nonnegative?: boolean;
  negative?: boolean;
  nonpositive?: boolean;
  multipleOf?: bigint;
}
export interface BigIntFieldInit extends Omit<FieldInit, "type"> {
  validationOptions?: BigIntFieldValidationOptions;
}
export class BigIntField extends Field<bigint> {
  readonly validationOptions: BigIntFieldValidationOptions;

  constructor(init: BigIntFieldInit) {
    super({ ...init, type: "BigInt" });
    this.validationOptions = init.validationOptions || {};
  }

  _buildValidator(coerce?: boolean) {
    let v: z.ZodBigInt;
    if (coerce) {
      v = z.coerce.bigint();
    } else {
      v = z.bigint();
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
