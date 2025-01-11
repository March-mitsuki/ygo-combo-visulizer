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

export const models = [userModel];
