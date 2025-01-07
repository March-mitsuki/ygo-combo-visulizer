import { Router, Request as ExRequest, Response as ExResponse } from "express";

import type { Endpoint } from "@qupidjs/types/api";
import { ResponseCode } from "@qupidjs/types/api";
import { Model } from "../db/model";
import { ZodError } from "zod";
import {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
} from "@prisma/client/runtime/library";

export type Handler<E extends Endpoint> = (
  req: E["request"],
) => Promise<E["response"]>;

export class RouterBuilder {
  private _router: Router;

  constructor() {
    this._router = Router();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _buildHandler(handler: Handler<any>) {
    return async (req: ExRequest, res: ExResponse) => {
      try {
        const response = await handler({
          data: req.body,
          query: req.query,
          params: req.params,
        });
        res.status(200).send(response);
      } catch (error) {
        if (error instanceof ZodError) {
          const errors = error.errors.map((e) => ({
            message: e.message,
            path: e.path.join("."),
          }));
          res.status(200).send({
            code: ResponseCode.BadRequest,
            data: errors,
          });
        } else if (error instanceof PrismaClientKnownRequestError) {
          let message = "";
          switch (error.code) {
            case "P2002": {
              const target = error.meta?.target as string[] | undefined;
              message = `Unique constraint failed: ${target}`;
              break;
            }
            case "P2003": {
              message = "Foreign key constraint failed";
              break;
            }
            case "P2025": {
              message = error.meta?.cause as string;
              break;
            }
            default:
              console.error(
                "unhandle prisma konw error",
                error.code,
                error.meta,
                error.message,
              );
              message = error.message;
              break;
          }
          res.status(200).send({
            code: ResponseCode.BadRequest,
            data: message,
          });
        } else if (error instanceof PrismaClientUnknownRequestError) {
          res.status(200).send({
            code: ResponseCode.BadRequest,
            data: error.message,
          });
          console.error("unhandle prisma unkonw error", error);
        } else {
          throw error;
        }
      }

      return; // Do not call next() in endpoint handler
    };
  }

  add<E extends Endpoint>(
    method: E["method"],
    path: E["path"],
    handler: Handler<E>,
  ): this {
    switch (method) {
      case "GET":
        this._router.get(path, this._buildHandler(handler));
        break;
      case "POST":
        this._router.post(path, this._buildHandler(handler));
        break;
      case "PUT":
        this._router.put(path, this._buildHandler(handler));
        break;
      case "PATCH":
        this._router.patch(path, this._buildHandler(handler));
        break;
      case "DELETE":
        this._router.delete(path, this._buildHandler(handler));
        break;
      default:
        throw new Error(`Unsupported method: ${method}`);
    }
    return this;
  }

  decodeBase64UrlSafe(base64UrlSafe: unknown) {
    try {
      if (typeof base64UrlSafe !== "string") {
        return {};
      }

      let base64 = base64UrlSafe.replace(/-/g, "+").replace(/_/g, "/");
      base64 = base64.padEnd(
        base64.length + ((4 - (base64.length % 4)) % 4),
        "=",
      );

      const str = Buffer.from(base64, "base64").toString();
      console.log("decodeBase64UrlSafe", str);
      return JSON.parse(str);
    } catch (error) {
      console.error("decodeBase64UrlSafe error", error);
      return {};
    }
  }

  build() {
    return this._router;
  }
}

const popObj = <O = any, T extends Record<string, unknown> = any>(
  obj: T,
  key: string,
): O => {
  const result = obj[key];
  delete obj[key];
  return result as O;
};

export class ModelRouterBuilder<M extends Model> extends RouterBuilder {
  private _model: M;
  urlPrefix: string;

  constructor(model: M, urlPrefix?: string) {
    super();

    this._model = model;
    this.urlPrefix = urlPrefix || this._model.modelRoutePrefix;
  }

  private _makePath(path: string) {
    return `${this.urlPrefix}${path}`;
  }

  list() {
    return this.add("GET", this._makePath("/"), async (req) => {
      let cursor: number | undefined;
      let pageSize: number | undefined;
      let includes: string | undefined;
      let where: Record<string, unknown> | undefined;
      if (req.query) {
        cursor = parseInt(req.query?.cursor as string) || undefined;
        pageSize = parseInt(req.query?.pageSize as string) || undefined;
        includes = req.query?.includes as string;
        where = req.query?.where
          ? this.decodeBase64UrlSafe(req.query.where)
          : undefined;
      }

      const results = await this._model.list({
        cursor: cursor,
        pageSize: pageSize,
        search: {
          includes,
          where,
        },
      });

      const endpointPath = this._makePath("/");
      let next: string | null = null;
      if (results.next) {
        next = `${endpointPath}?cursor=${results.next}`;
        if (pageSize) {
          next += `&pageSize=${pageSize}`;
        }
        if (includes) {
          next += `&includes=${includes}`;
        }
        if (where) {
          next += `&where=${req.query?.where}`;
        }
      }

      return {
        code: ResponseCode.Success,
        data: {
          ...results,
          next,
        },
      };
    });
  }

  create() {
    return this.add("POST", this._makePath("/"), async (req) => {
      const result = await this._model.create(req.data);

      return {
        code: ResponseCode.Created,
        data: result,
      };
    });
  }

  retrieve() {
    return this.add("GET", this._makePath("/:id"), async (req) => {
      if (!req.params) {
        throw new Error("Invalid params");
      }
      const pk = parseInt(req.params.id as string);
      if (isNaN(pk)) {
        throw new Error("Invalid id");
      }

      const result = await this._model.retrieve(pk);

      return {
        code: ResponseCode.Success,
        data: result,
      };
    });
  }

  update() {
    return this.add("PATCH", this._makePath("/:id"), async (req) => {
      if (!req.params) {
        throw new Error("Invalid params");
      }
      const pk = parseInt(req.params.id as string);
      if (isNaN(pk)) {
        throw new Error("Invalid id");
      }

      const result = await this._model.update(pk, req.data);

      return {
        code: ResponseCode.Success,
        data: result,
      };
    });
  }

  destroy() {
    return this.add("DELETE", this._makePath("/:id"), async (req) => {
      if (!req.params) {
        throw new Error("Invalid params");
      }
      const pk = parseInt(req.params.id as string);
      if (isNaN(pk)) {
        throw new Error("Invalid id");
      }

      await this._model.delete(pk);

      return {
        code: ResponseCode.Success,
        data: null,
      };
    });
  }

  enableAll() {
    return this.list().create().retrieve().update().destroy();
  }
}
