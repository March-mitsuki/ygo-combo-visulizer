/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";
import { PagenationResult } from "@qupidjs/types/api";
import { Field } from "./fields";
import { RelationField } from "./fields/relation";

export type PagenationParams = {
  cursor?: number;
  pageSize?: number;
};
export type PrismaSearchQuery = {
  include?: Record<string, boolean>;
  where?: Record<string, any>;
};
export type SearchQuery = {
  includes?: string; // string separated by comma, e.g. "posts,profile"
  where?: Record<string, any>;
};

export type ListParams = PagenationParams & {
  search?: SearchQuery;
};

export type ModelInit = {
  name: string;
  fields: Field[];
  meta?: ModelMeta;
  modelRoutePrefix?: string;
};
export type ModelMeta = {
  id?: string[];
  unique?: string[] | { fields: string[]; name: string; map?: string };
  index?: string[] | { fields: string[]; name: string };
  map?: string;
};
type ModelSchema = z.ZodObject<any>;
type ValidateOptions = {
  coerce?: boolean;
};
type WithIdValidateOptions = {
  partial?: boolean;
  coerce?: boolean;
};

export class Model<T = unknown> {
  readonly name: string;
  readonly fields: Field[];
  readonly meta: ModelMeta;
  readonly modelRoutePrefix: string;
  schema: ModelSchema;
  schemaCoerce: ModelSchema;
  private _relationFieldsAttached = false;
  private _relationFieldsAttachedCoerce = false;

  constructor(
    { name, fields, meta = {}, modelRoutePrefix }: ModelInit = {
      name: "",
      fields: [],
    },
  ) {
    this.name = name;
    this.fields = fields;
    this.meta = meta;
    this.schema = this._buildSchema();
    this.schemaCoerce = this._buildSchema(true);
    this.modelRoutePrefix = modelRoutePrefix || `/${name.toLowerCase()}`;
  }

  private _buildSchema(coerce = false) {
    const schemaDefinition: Record<string, z.ZodType> = {};
    for (const field of this.fields) {
      if (field.readOnly) continue;

      if (field instanceof RelationField) {
        continue;
      } else {
        if (coerce) {
          schemaDefinition[field.name] = field.validatorCoerce;
        } else {
          schemaDefinition[field.name] = field.validator;
        }
      }
    }
    return z.object(schemaDefinition);
  }

  /**
   * Get the name of the Prisma client.
   */
  get prisma_client_name() {
    return this.name.charAt(0).toLowerCase() + this.name.slice(1);
  }

  get id_fields() {
    if (this.meta.id) {
      return this.fields.filter((field) => this.meta.id?.includes(field.name));
    } else {
      return this.fields.filter((field) => field.id);
    }
  }

  private _attachRelationFieldsSchemaCoerce() {
    if (this._relationFieldsAttachedCoerce) return;

    const relationFields = this.fields.filter(
      (field) => field instanceof RelationField,
    );
    if (relationFields.length > 0) {
      const relationSchemaDefinition: Record<string, z.ZodType> = {};

      for (const relation of relationFields) {
        if (relation.references.length === 0) {
          // Host model
          relationSchemaDefinition[relation.name] = relation.validatorCoerce;
        } else {
          // Foreign model
          for (const rf of relation.fields) {
            relationSchemaDefinition[`${rf.name}`] = rf.validatorCoerce;
          }
        }
      }

      console.log("attachRelationFieldsSchemaCoerce", relationSchemaDefinition);
      this.schemaCoerce = this.schemaCoerce.extend(relationSchemaDefinition);
    }
    this._relationFieldsAttachedCoerce = true;
  }

  private _attachRelationFieldsSchema() {
    if (this._relationFieldsAttached) return;

    const relationFields = this.fields.filter(
      (field) => field instanceof RelationField,
    );
    if (relationFields.length > 0) {
      const relationSchemaDefinition: Record<string, z.ZodType> = {};

      for (const relation of relationFields) {
        if (relation.references.length === 0) {
          // Host model
          relationSchemaDefinition[relation.name] = relation.validator;
        } else {
          // Foreign model
          for (const rf of relation.fields) {
            relationSchemaDefinition[`${rf.name}`] = rf.validatorCoerce;
          }
        }
      }

      console.log("attachRelationFieldsSchema", relationSchemaDefinition);
      this.schema = this.schema.extend(relationSchemaDefinition);
    }
    this._relationFieldsAttached = true;
  }

  validateData(data: unknown, { coerce }: ValidateOptions = {}) {
    let validatedData: any;

    if (coerce) {
      this._attachRelationFieldsSchema();
      validatedData = this.schema.parse(data);
    } else {
      this._attachRelationFieldsSchemaCoerce();
      validatedData = this.schemaCoerce.parse(data);
    }

    return validatedData as T;
  }

  debugZodSchema(schema: z.ZodObject<any>) {
    const shape = schema.shape;
    const result: Record<string, any> = {};
    for (const key in shape) {
      const currentShape = shape[key];
      if (currentShape._def.innerType) {
        result[key] = {
          name: currentShape._def.typeName,
          inner: {
            name: currentShape._def.innerType._def.typeName,
            coerce: currentShape._def.innerType._def.coerce,
            description: currentShape._def.innerType._def.description,
          },
        };
      } else {
        result[key] = {
          name: currentShape._def.typeName,
          coerce: currentShape._def.coerce,
          description: currentShape._def.description,
        };
      }
    }
    return result;
  }

  validateUpdate(data: unknown, { coerce }: ValidateOptions = {}) {
    let validatedData: any;
    const omitDefinition: Record<string, boolean> = {};
    for (const field of this.fields) {
      if (field.createOnly) {
        omitDefinition[field.name] = true;
      }
    }

    if (coerce) {
      this._attachRelationFieldsSchema();

      validatedData = this.schemaCoerce
        .omit(omitDefinition as any)
        .partial()
        .parse(data);
    } else {
      this._attachRelationFieldsSchemaCoerce();

      validatedData = this.schema
        .omit(omitDefinition as any)
        .partial()
        .parse(data);
    }
    return validatedData as Partial<T>;
  }

  validateDataWithId(
    data: unknown,
    { partial, coerce }: WithIdValidateOptions = {},
  ) {
    if (coerce) {
      this._attachRelationFieldsSchemaCoerce();

      if (partial) {
        const schema = this.schemaCoerce
          .extend({
            id: z.coerce.number().safe(),
          })
          .partial();
        console.log("validateDataWithId coerce", this.debugZodSchema(schema));
        return schema.parse(data);
      } else {
        const schema = this.schemaCoerce.extend({
          id: z.coerce.number().safe(),
        });
        return schema.parse(data);
      }
    } else {
      this._attachRelationFieldsSchema();

      if (partial) {
        const schema = this.schema
          .extend({
            id: z.number().safe(),
          })
          .partial();
        return schema.parse(data);
      } else {
        const schema = this.schema.extend({
          id: z.number().safe(),
        });
        return schema.parse(data);
      }
    }
  }

  private _handleSearchQuery(query?: SearchQuery): PrismaSearchQuery {
    if (!query) return {};

    const result: PrismaSearchQuery = {};
    try {
      const validatedData = this.validateDataWithId(query.where, {
        partial: true,
        coerce: true,
      });
      result.where = validatedData;
    } catch (e) {
      console.log("search query validation error", e.message);
    }

    const clientIncludes = query.includes ? query.includes.split(",") : [];
    const acceptIncludes: string[] = [];
    for (const field of this.fields) {
      if (field instanceof RelationField) {
        console.log("handle RelationField", field.name, clientIncludes);
        clientIncludes.includes(field.name) && acceptIncludes.push(field.name);
      }
    }
    for (const include of acceptIncludes) {
      if (!result.include) result.include = {};
      result.include[include] = true;
    }

    return result;
  }

  async list({ cursor, pageSize, search }: ListParams = {}): Promise<
    PagenationResult<T>
  > {
    // eslint-disable-next-line
    // @ts-ignore
    const client = process.app.prisma[this.prisma_client_name];

    console.log(`list ${this.name} with search`, search);
    const searchQuery = this._handleSearchQuery(search);

    let _pageSize = pageSize ? pageSize : process.app.config.db.maxPageSize;
    if (_pageSize > process.app.config.db.maxPageSize) {
      _pageSize = process.app.config.db.maxPageSize;
    }
    const _cursor = cursor ? { id: cursor } : undefined;
    console.log("findMany with", {
      take: pageSize ? pageSize + 1 : process.app.config.db.maxPageSize,
      cursor: cursor ? { id: cursor } : undefined,
      where: searchQuery.where,
      include: searchQuery.include,
    });
    const data = await client.findMany({
      take: _pageSize + 1,
      cursor: _cursor,
      where: searchQuery.where,
      include: searchQuery.include,
    });
    const hasNext = data.length > _pageSize;
    const totalCount = await client.count({
      where: searchQuery.where,
    });

    if (data.length > 0) {
      return {
        total: totalCount,
        results: hasNext ? data.slice(0, pageSize) : data,
        count: hasNext ? pageSize : data.length,
        next: hasNext ? data[data.length - 1].id.toString() : null,
      };
    } else {
      return {
        total: 0,
        results: [],
        count: 0,
        next: null,
      };
    }
  }

  async retrieve(id: number): Promise<T | null> {
    // eslint-disable-next-line
    // @ts-ignore
    return await process.app.prisma[this.prisma_client_name].findUnique({
      where: { id },
    });
  }

  async create(data: any): Promise<T> {
    // eslint-disable-next-line
    // @ts-ignore
    return await process.app.prisma[this.prisma_client_name].create({
      data: this.validateData(data),
    });
  }

  async update(id: number, data: unknown): Promise<T> {
    // eslint-disable-next-line
    // @ts-ignore
    return await process.app.prisma[this.prisma_client_name].update({
      where: { id },
      data: this.validateUpdate(data),
    });
  }

  async delete(id: number) {
    // eslint-disable-next-line
    // @ts-ignore
    await process.app.prisma[this.prisma_client_name].delete({
      where: { id },
    });
  }
}
