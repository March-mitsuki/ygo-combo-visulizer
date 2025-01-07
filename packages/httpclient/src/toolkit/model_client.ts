import { HttpClient } from "../core";
import {
  JsonData,
  PagenationResult,
  Response,
  Creation,
  Update,
} from "@qupidjs/types/api";

export type SearchQuery = {
  includes?: string[];
  where?: Record<string, any>;
};
export type ListParams = {
  cursor?: string;
  pageSize?: string;
  search?: SearchQuery;
};
export interface ListResponse<M extends JsonData> extends Response {
  data: PagenationResult<M>;
}
export interface ModelDataResponse<M extends JsonData> extends Response {
  data: M;
}
export type ModelHttpCLientInit = {
  baseUrl: string;
  prefix?: string;
};
export class ModelHttpClient<M extends JsonData> extends HttpClient {
  readonly prefix: string = "";

  constructor({ baseUrl, prefix }: ModelHttpCLientInit) {
    super(baseUrl);
    if (prefix) this.prefix = prefix;
  }

  static objectToBase64UrlSafe(data: Record<string, any>) {
    return btoa(JSON.stringify(data))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }

  list({ cursor, pageSize, search }: ListParams = {}) {
    const query: Record<string, string | number> = {};
    if (cursor) query.cursor = cursor;
    if (pageSize) query.pageSize = pageSize;
    if (search?.includes) query.includes = search.includes.join(",");
    if (search?.where)
      query.where = ModelHttpClient.objectToBase64UrlSafe(search.where);

    return this.do({
      method: "GET",
      path: `${this.prefix}/`,
      query,
    }) as Promise<ListResponse<M>>;
  }

  create(data: Creation<M>) {
    return this.do({
      method: "POST",
      path: `${this.prefix}/`,
      data,
    }) as Promise<ModelDataResponse<M>>;
  }

  retrieve(id: number) {
    return this.do({
      method: "GET",
      path: `${this.prefix}/:id`,
      params: { id },
    }) as Promise<ModelDataResponse<M>>;
  }

  update(id: number, data: Update<M>) {
    return this.do({
      method: "PATCH",
      path: `${this.prefix}/:id`,
      params: { id },
      data,
    }) as Promise<ModelDataResponse<M>>;
  }

  destroy(id: number) {
    return this.do({
      method: "DELETE",
      path: `${this.prefix}/:id`,
      params: { id },
    });
  }
}
