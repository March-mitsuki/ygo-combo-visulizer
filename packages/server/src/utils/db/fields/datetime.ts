import { z } from "zod";
import { Field, FieldInit, ValidationOptions } from "./common";

export interface DateTimeFieldValidationOptions extends ValidationOptions {
  min?: Date;
  max?: Date;
}
export interface DateTimeFieldInit extends Omit<FieldInit, "type"> {
  validationOptions?: DateTimeFieldValidationOptions;
}
export class DateTimeField extends Field<Date> {
  readonly validationOptions: DateTimeFieldValidationOptions;

  constructor(init: DateTimeFieldInit) {
    super({ ...init, type: "DateTime" });
    this.validationOptions = init.validationOptions || {};
  }

  _buildValidator(coerce?: boolean) {
    let v: z.ZodDate;
    if (coerce) {
      v = z.coerce.date();
    } else {
      v = z.date();
    }

    if (this.validationOptions.min) {
      v = v.min(this.validationOptions.min);
    }
    if (this.validationOptions.max) {
      v = v.max(this.validationOptions.max);
    }

    return v;
  }
}
