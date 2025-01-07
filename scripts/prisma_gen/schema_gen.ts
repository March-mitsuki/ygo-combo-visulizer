import {
  createDataSource,
  createGenerator,
  createModel,
  createScalarField,
  createObjectField,
  createSchema,
  print,
} from "prisma-schema-dsl";
import {
  ScalarType,
  ScalarField,
  ScalarFieldDefault,
  ObjectField,
  ReferentialActions,
  DataSourceProvider,
} from "prisma-schema-dsl-types";
import { Model as SelfModel } from "@server/utils/db/model";
import {
  Field as SelfField,
  RelationField,
  FieldTypes,
} from "@server/utils/db/fields";

export type GenPrismaSchemaOptions = {
  provider: string;
  url: string;
};
export const genPrismaSchema = (
  models: SelfModel[],
  { provider, url }: GenPrismaSchemaOptions,
) => {
  const modelSchemas = models.map((model) => genSingleModel(model));
  const dataSource = createDataSource(
    "db",
    mapDataSourceProvider(provider),
    url,
  );

  const generator = createGenerator("client", "prisma-client-js");
  return print(createSchema(modelSchemas, [], dataSource, [generator]));
};

type ModelArgs = {
  name: string;
  fields: (ScalarField | ObjectField)[];
  documentation?: string;
  map?: string;
  attributes: string[];
};
const genSingleModel = (model: SelfModel) => {
  const args: ModelArgs = {
    name: model.name,
    fields: [],
    attributes: [],
  };

  const modelFields: (ScalarField | ObjectField)[] = [];
  for (const field of model.fields) {
    if (field.type === "Relation") {
      const relationFields = field as RelationField;
      const relationObjectFields = createObjectField(
        ...makeObjectTypeArgs(relationFields),
      );
      const relationScalarFields = relationFields.fields.map((field) => {
        if (field.type === "Relation") {
          throw new Error("Nested relations are not supported");
        }
        return createScalarField(...makeScalarTypeArgs(field));
      });

      modelFields.push(relationObjectFields);
      modelFields.push(...relationScalarFields);
    } else {
      modelFields.push(createScalarField(...makeScalarTypeArgs(field)));
    }
  }
  args.fields = modelFields;

  if (model.meta.id)
    args.attributes.push(`@@id([${model.meta.id.join(", ")}])`);
  if (model.meta.unique) {
    if (Array.isArray(model.meta.unique)) {
      args.attributes.push(`@@unique([${model.meta.unique.join(", ")}])`);
    } else {
      if (model.meta.unique.map) {
        args.attributes.push(
          `@@unique(fields: [${model.meta.unique.fields.join(", ")}], name: "${
            model.meta.unique.name
          }", map: "${model.meta.unique.map}")`,
        );
      } else {
        args.attributes.push(
          `@@unique(fields: [${model.meta.unique.fields.join(", ")}], name: "${
            model.meta.unique.name
          }")`,
        );
      }
    }
  }
  if (model.meta.index) {
    if (Array.isArray(model.meta.index)) {
      args.attributes.push(`@@index([${model.meta.index.join(", ")}])`);
    } else {
      args.attributes.push(
        `@@index(fields: [${model.meta.index.fields.join(", ")}], name: "${
          model.meta.index.name
        }")`,
      );
    }
  }

  return createModel(
    args.name,
    args.fields,
    args.documentation,
    model.meta.map,
    args.attributes,
  );
};

type ScalarArgs = {
  name?: string;
  scalarType?: ScalarType;
  isList?: boolean;
  isRequired?: boolean;
  isUnique?: boolean;
  isId?: boolean;
  isUpdatedAt?: boolean;
  defaultValue?: ScalarFieldDefault;
  documentation?: string;
  isForeignKey?: boolean;
  attributes: string[];
};
const makeScalarTypeArgs = (field: SelfField) => {
  const args: ScalarArgs = {
    attributes: [],
  };
  args.name = field.name;
  args.scalarType = mapScalarType(field.type);
  if (field.defaultValue) args.defaultValue = field.defaultValue;
  if (field.autoIncrement) args.attributes.push("@default(autoincrement())");
  if (field.isList) args.isList = true;
  if (field.nullable) {
    args.isRequired = false;
  } else {
    args.isRequired = true;
  }
  if (field.unique) args.isUnique = true;
  if (field.id) args.isId = true;
  if (field.updatedAt) args.isUpdatedAt = true;
  if (field.map) args.attributes.push(`@map("${field.map}")`);

  return [
    args.name,
    args.scalarType,
    args.isList,
    args.isRequired,
    args.isUnique,
    args.isId,
    args.isUpdatedAt,
    args.defaultValue,
    args.documentation,
    args.isForeignKey,
    args.attributes,
  ] as const;
};

type ObjectArgs = {
  name?: string;
  type?: string;
  isList?: boolean;
  isRequired?: boolean;
  relationName?: string | null;
  relationFields?: string[];
  relationReferences?: string[];
  relationOnDelete?: ReferentialActions;
  relationOnUpdate?: ReferentialActions;
  documentation?: string;
  attributes: string[];
};
const makeObjectTypeArgs = (field: RelationField) => {
  const args: ObjectArgs = {
    attributes: [],
  };
  args.name = field.name;
  args.type = field.model().name;
  if (field.isList) args.isList = true;
  if (field.nullable) {
    args.isRequired = false;
  } else {
    args.isRequired = true;
  }
  args.relationFields = field.fields.map((field) => field.name);
  args.relationReferences = field.references;
  if (field.unique) args.attributes.push("@unique");

  return [
    args.name,
    args.type,
    args.isList,
    args.isRequired,
    args.relationName,
    args.relationFields,
    args.relationReferences,
    args.relationOnDelete,
    args.relationOnUpdate,
    args.documentation,
    args.attributes,
  ] as const;
};

const mapDataSourceProvider = (provider: string) => {
  switch (provider) {
    case "postgresql":
      return DataSourceProvider.PostgreSQL;
    case "mysql":
      return DataSourceProvider.MySQL;
    case "sqlite":
      return DataSourceProvider.SQLite;
    case "mongodb":
      return DataSourceProvider.MongoDB;
    case "sqlserver":
      return DataSourceProvider.MSSQLServer;
    default:
      throw new Error(`Unknown data source provider: ${provider}`);
  }
};
const mapScalarType = (type: FieldTypes) => {
  switch (type) {
    case "String":
      return ScalarType.String;
    case "Int":
      return ScalarType.Int;
    case "BigInt":
      return ScalarType.BigInt;
    case "Float":
      return ScalarType.Float;
    case "Boolean":
      return ScalarType.Boolean;
    case "DateTime":
      return ScalarType.DateTime;
    case "Json":
      return ScalarType.Json;
    default:
      throw new Error(`Unknown scalar type: ${type}`);
  }
};
