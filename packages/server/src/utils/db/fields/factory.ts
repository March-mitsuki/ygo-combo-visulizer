import { BigIntField, BigIntFieldInit } from "./bigint";
import { BooleanField, BooleanFieldInit } from "./boolean";
import { DateTimeField, DateTimeFieldInit } from "./datetime";
import { FloatField, FloatFieldInit } from "./float";
import { IntField, IntFieldInit } from "./int";
import { RelationField, RelationFieldInit } from "./relation";
import { StringField, StringFieldInit } from "./string";

export const string = (init: StringFieldInit) => new StringField(init);
export const int = (init: IntFieldInit) => new IntField(init);
export const bigint = (init: BigIntFieldInit) => new BigIntField(init);
export const float = (init: FloatFieldInit) => new FloatField(init);
export const boolean = (init: BooleanFieldInit) => new BooleanField(init);
export const datetime = (init: DateTimeFieldInit) => new DateTimeField(init);
export const relation = (init: RelationFieldInit) => new RelationField(init);
