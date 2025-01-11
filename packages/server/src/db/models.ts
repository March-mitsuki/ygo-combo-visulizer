import { fields, DefaultValue } from "@server/utils/db/fields";
import { Model } from "@server/utils/db/model";

const intIdField = fields.int({
  name: "id",
  id: true,
  autoIncrement: true,
  readOnly: true,
});
const basicFields = [
  fields.datetime({
    name: "createdAt",
    defaultValue: DefaultValue.now(),
    readOnly: true,
  }),
  fields.datetime({
    name: "updatedAt",
    updatedAt: true,
    readOnly: true,
  }),
];

export const userModel: Model = new Model({
  name: "User",
  fields: [
    intIdField,
    ...basicFields,
    fields.string({
      name: "email",
      unique: true,
      validationOptions: { email: true },
    }),
    fields.string({
      name: "username",
      unique: true,
      validationOptions: { min: 3, max: 64 },
    }),
    fields.string({ name: "nickname", validationOptions: { optional: true } }),
    fields.string({ name: "password", createOnly: true }),
    fields.int({
      name: "age",
      nullable: true,
      validationOptions: { optional: true, positive: true },
    }),
  ],
});

export const cardDeckModel: Model = new Model({
  name: "CardDeck",
  fields: [
    intIdField,
    ...basicFields,
    fields.relation({
      name: "user",
      model: () => userModel,
      fields: [fields.int({ name: "userId" })],
      references: ["id"],
    }),
    fields.string({ name: "name" }),
  ],
});

export const finalFieldModel: Model = new Model({
  name: "FinalField",
  fields: [
    intIdField,
    ...basicFields,
    fields.string({ name: "name" }),
    fields.relation({
      name: "cardDeck",
      model: () => cardDeckModel,
      fields: [fields.int({ name: "cardDeckId" })],
      references: ["id"],
    }),
  ],
});

export const stepsModel: Model = new Model({
  name: "Steps",
  fields: [
    intIdField,
    ...basicFields,
    fields.string({ name: "name" }),
    fields.relation({
      name: "cardDeck",
      model: () => cardDeckModel,
      fields: [fields.int({ name: "cardDeckId" })],
      references: ["id"],
    }),
    fields.relation({
      name: "finalField",
      model: () => finalFieldModel,
      fields: [fields.int({ name: "finalFieldId" })],
      references: ["id"],
    }),
    fields.string({ name: "data" }),
  ],
});

export const models = [userModel, cardDeckModel, finalFieldModel, stepsModel];
