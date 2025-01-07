import { ZodType } from "zod";

export type FieldTypes =
  | "String"
  | "Int"
  | "BigInt"
  | "Float"
  | "Boolean"
  | "DateTime"
  | "Json"
  | "Relation";
export const DefaultValue = {
  now: () => "now()",
  cuid: () => "cuid()",
  uuid: () => "uuid()",
  dbgenerated: (literal: string) => `dbgenerated(${literal})`,
  string: (literal: string) => `"${literal}"`,
  number: (literal: number) => literal,
};
export interface ValidationOptions {
  optional?: boolean;
  void?: boolean;
}
export interface FieldInit {
  type: FieldTypes;
  name: string;
  defaultValue?: string | number;
  autoIncrement?: boolean;
  isList?: boolean;
  nullable?: boolean;
  unique?: boolean;
  id?: boolean;
  updatedAt?: boolean;
  map?: string;
  readOnly?: boolean;
  createOnly?: boolean;
  validationOptions?: ValidationOptions;
}

export abstract class Field<T = any> {
  readonly type: FieldTypes;
  readonly name: string;
  readonly defaultValue: string | number | undefined;
  readonly autoIncrement: boolean;
  readonly isList: boolean;
  readonly nullable: boolean;
  readonly unique: boolean;
  readonly id: boolean;
  readonly updatedAt: boolean;
  readonly map: string | undefined;
  readonly readOnly: boolean;
  readonly createOnly: boolean;
  readonly validationOptions: ValidationOptions | undefined;

  private _validator: ZodType | undefined;
  private _validatorCoerce: ZodType | undefined;

  constructor({
    type,
    name,
    defaultValue,
    autoIncrement = false,
    isList = false,
    nullable = false,
    unique = false,
    id = false,
    updatedAt = false,
    map,
    readOnly = false,
    createOnly = false,
    validationOptions = {},
  }: FieldInit) {
    this.type = type;
    this.name = name;
    this.defaultValue = defaultValue;
    this.autoIncrement = autoIncrement;
    this.isList = isList;
    this.nullable = nullable;
    this.unique = unique;
    this.id = id;
    this.updatedAt = updatedAt;
    this.map = map;
    this.readOnly = readOnly;
    this.createOnly = createOnly;
    this.validationOptions = validationOptions;
  }

  abstract _buildValidator(coerce?: boolean): ZodType;

  get validator() {
    if (!this._validator) {
      this._validator = this._buildValidator();
    }
    return this._validator;
  }

  get validatorCoerce() {
    if (!this._validatorCoerce) {
      this._validatorCoerce = this._buildValidator(true);
    }
    return this._validatorCoerce;
  }

  validate(data: unknown): T {
    return this.validator.parse(data);
  }

  coerce(data: unknown): T {
    return this.validatorCoerce.parse(data);
  }
}
