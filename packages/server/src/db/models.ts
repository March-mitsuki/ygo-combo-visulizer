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
    fields.relation({
      name: "posts",
      model: () => postModel,
      isList: true,
      validationOptions: { optional: true },
    }),
    fields.relation({
      name: "profile",
      model: () => profileModel,
      nullable: true,
      validationOptions: { optional: true },
    }),
  ],
});

export const postModel: Model = new Model({
  name: "Post",
  fields: [
    intIdField,
    ...basicFields,
    fields.string({ name: "title" }),
    fields.string({ name: "content" }),
    fields.relation({
      name: "author",
      model: () => userModel,
      fields: [fields.int({ name: "authorId" })],
      references: ["id"],
    }),
  ],
});

export const profileModel: Model = new Model({
  name: "Profile",
  fields: [
    intIdField,
    ...basicFields,
    fields.string({ name: "blogLink" }),
    fields.relation({
      name: "user",
      model: () => userModel,
      fields: [fields.int({ name: "userId", unique: true })],
      references: ["id"],
    }),
  ],
});

export const models = [userModel, postModel, profileModel];
