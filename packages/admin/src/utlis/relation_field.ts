/* eslint-disable @typescript-eslint/no-explicit-any */
import { Model } from "@server/utils/db/model";
import { RelationField } from "@server/utils/db/fields";
import { ModelHttpClient } from "@qupidjs/httpclient";

export const findAllReferences = async (
  model: Model,
  searchParams: URLSearchParams,
) => {
  const result: {
    errors: string[];
    references: Record<string, any>;
  } = {
    errors: [],
    references: {},
  };

  for (const field of model.fields) {
    if (field.type === "Relation") {
      const relationField = field as RelationField;
      if (relationField.references.length > 0) {
        // Foreign model
        if (!searchParams.get(relationField.model().name)) {
          console.warn("No reference found for", relationField.model().name);
          continue;
        }
        const intId = parseInt(
          searchParams.get(relationField.model().name) as string,
        );
        if (isNaN(intId)) {
          console.warn("Invalid reference id", intId);
          continue;
        }

        // 给的是 Host model 的 id, 需要找到对应的 Foreign key 的数据
        const upstreamClient = new ModelHttpClient<any>({
          baseUrl: window.app.config.baseUrl,
          prefix: relationField.model().modelRoutePrefix,
        });
        const upstreamRes = await upstreamClient.retrieve(intId);
        if (!upstreamRes.data) {
          result.errors.push(
            `No upstream data found for <${relationField.model().name} ${intId}>`,
          );
          continue;
        }
        for (const [idx, rf] of relationField.fields.entries()) {
          result.references[rf.name] =
            upstreamRes.data[relationField.references[idx]];
        }
      }
    }
  }

  return result;
};

/**
 * e.g. Will return `{ "authorId": "id" }` from the following data:
 *  ```ts
 *  export const userModel: Model = new Model({
 *    name: "User",
 *    fields: [
 *      ...,
 *      fields.relation({
 *        name: "posts",
 *        model: () => postModel,
 *        isList: true,
 *        validationOptions: { optional: true },
 *      }),
 *    ],
 *  });
 *  export const postModel: Model = new Model({
 *    name: "Post",
 *    fields: [
 *      ...,
 *      fields.relation({
 *        name: "author",
 *        model: () => userModel,
 *        fields: [fields.int({ name: "authorId" })],
 *        references: ["id"],
 *      }),
 *    ],
 *  });
 *  ```
 */
export const getReferenceFieldMap = (field: RelationField) => {
  // { "field_name": "reference_field_name" }
  const map: Record<string, string> = {};

  for (const [idx, f] of field.fields.entries()) {
    map[f.name] = field.references[idx];
  }

  return map;
};

/**
 * e.g. Will return `{ authorId: 1 }` when given the example data.
 */
export const getReferenceFieldData = (
  field: RelationField, // Foreign model relation field
  record: Record<string, any>, // Foreign model record
) => {
  // { "field_name": "reference_field_value" }
  const data: Record<string, any> = {};
  for (const rf of field.fields) {
    data[rf.name] = record[rf.name];
  }
  return data;
};

/**
 * e.g. Will return `{ authorId: 1 }` when given <User 1> and `posts` field
 */
export const getChildModelReferenceFieldData = (
  modelName: string, // Host model
  field: RelationField, // Host model relation field
  record: Record<string, any>, // Host model record
) => {
  const data: Record<string, any> = {};

  const childModel = field.model();
  const childModelReferenceFieldToThisHost = childModel.fields.find((field) => {
    if (field.type === "Relation") {
      const f = field as RelationField;
      return f.model().name === modelName;
    }
    return false;
  }) as RelationField | undefined;
  if (!childModelReferenceFieldToThisHost) {
    console.error(
      "No reference field found for",
      modelName,
      "in",
      childModel.name,
    );
    return data;
  }

  const map = getReferenceFieldMap(childModelReferenceFieldToThisHost);
  for (const [referenceField, hostField] of Object.entries(map)) {
    data[referenceField] = record[hostField];
  }

  return data;
};

/**
 * Will return model primary keys from a record.
 *
 * If the model has multiple primary keys, it will return all of them.
 *
 * 目前还没对应多个主键的情况, 之后再补充
 */
export const getModelIDs = (model: Model, record: Record<string, any>) => {
  const pks: Record<string, any> = {};

  for (const field of model.id_fields) {
    pks[field.name] = record[field.name];
  }

  return pks;
};

export const formatReferenceFieldData = (
  field: RelationField,
  record: Record<string, any>,
  joiner = ", ",
) => {
  const data = getReferenceFieldData(field, record);
  const map = getReferenceFieldMap(field);
  return Object.entries(data)
    .map(([k, v]) => `${map[k]}=${v}`)
    .join(joiner);
};
