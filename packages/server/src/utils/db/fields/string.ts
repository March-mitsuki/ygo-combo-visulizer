import { z } from "zod";
import { Field, FieldInit } from "./common";
import { ValidationOptions } from "./common";

export interface StringFieldValidationOptions extends ValidationOptions {
  max?: number;
  min?: number;
  length?: number;
  email?: boolean;
  url?: boolean;
  emoji?: boolean;
  uuid?: boolean;
  nanoid?: boolean;
  cuid?: boolean;
  cuid2?: boolean;
  ulid?: boolean;
  regex?: RegExp;
  includes?: string;
  startsWith?: string;
  endsWith?: string;
  datetime?: boolean;
  ip?: boolean;
  date?: boolean;
  time?: boolean;
  duration?: boolean;
  base64?: boolean;
}
export interface StringFieldInit extends Omit<FieldInit, "type"> {
  validationOptions?: StringFieldValidationOptions;
}
export class StringField extends Field<string> {
  readonly validationOptions: StringFieldValidationOptions;

  constructor(init: StringFieldInit) {
    super({ ...init, type: "String" });
    this.validationOptions = init.validationOptions || {};
  }

  _buildValidator(coerce?: boolean) {
    let v: z.ZodString;
    if (coerce) {
      v = z.coerce.string();
    } else {
      v = z.string();
    }

    if (this.validationOptions.max) {
      v = v.max(this.validationOptions.max);
    }
    if (this.validationOptions.min) {
      v = v.min(this.validationOptions.min);
    }
    if (this.validationOptions.length) {
      v = v.length(this.validationOptions.length);
    }
    if (this.validationOptions.email) {
      v = v.email();
    }
    if (this.validationOptions.url) {
      v = v.url();
    }
    if (this.validationOptions.emoji) {
      v = v.emoji();
    }
    if (this.validationOptions.uuid) {
      v = v.uuid();
    }
    if (this.validationOptions.nanoid) {
      v = v.nanoid();
    }
    if (this.validationOptions.cuid) {
      v = v.cuid();
    }
    if (this.validationOptions.cuid2) {
      v = v.cuid2();
    }
    if (this.validationOptions.ulid) {
      v = v.ulid();
    }
    if (this.validationOptions.regex) {
      v = v.regex(this.validationOptions.regex);
    }
    if (this.validationOptions.includes) {
      v = v.includes(this.validationOptions.includes);
    }
    if (this.validationOptions.startsWith) {
      v = v.startsWith(this.validationOptions.startsWith);
    }
    if (this.validationOptions.endsWith) {
      v = v.endsWith(this.validationOptions.endsWith);
    }
    if (this.validationOptions.datetime) {
      v = v.datetime();
    }
    if (this.validationOptions.ip) {
      v = v.ip();
    }
    if (this.validationOptions.date) {
      v = v.date();
    }
    if (this.validationOptions.time) {
      v = v.time();
    }
    if (this.validationOptions.duration) {
      v = v.duration();
    }
    if (this.validationOptions.base64) {
      v = v.base64();
    }

    return v;
  }
}
