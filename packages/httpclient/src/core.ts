import type { JsonData, Endpoint } from "@qupidjs/types/api";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

export type Handler<E extends Endpoint> = (
  req: E["request"],
) => Promise<E["response"]>;

export class NeedReLoginError extends Error {}
export class RequestError extends Error {
  status: number;
  json: JsonData;

  constructor({
    message,
    status,
    json,
  }: {
    message: string;
    status: number;
    json: JsonData;
  }) {
    super(message);
    this.status = status;
    this.json = json;
  }
}

export type EndpointParams<E extends Endpoint> = {
  method: E["method"];
  path: E["path"];
} & (undefined extends E["request"]["authToken"]
  ? { authToken?: E["request"]["authToken"] }
  : {
      authToken: E["request"]["authToken"];
    }) &
  (undefined extends E["request"]["params"]
    ? { params?: E["request"]["params"] }
    : {
        params: E["request"]["params"];
      }) &
  (undefined extends E["request"]["query"]
    ? { query?: E["request"]["query"] }
    : {
        query: E["request"]["query"];
      }) &
  (undefined extends E["request"]["data"]
    ? { data?: E["request"]["data"] }
    : {
        data: E["request"]["data"];
      });

export class HttpClient {
  protected readonly baseUrl: string;

  private _retryCount = 0;
  private _withRetry = 3;
  private _pageSize = 2;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setMaxRetry(count: number): this {
    this._withRetry = count;
    return this;
  }
  setPageSize(limit: number): this {
    this._pageSize = limit;
    return this;
  }

  private _replaceUrlParams<E extends Endpoint>(
    path: E["path"],
    params: E["request"]["params"],
  ) {
    if (!params) return path;

    /*                                            /g => match global                                                                                                           */
    /*                    (                      ) => save the catch result                                                                                                    */
    /*                              [a-zA-Z0-9_]* => catch group consecutive after [a-zA-Z_] until it encounters the first char that does not belong to `a-z` `A-Z` `0-9` `_`. */
    /*                     [a-zA-Z_] => catch group start with `a-z` or `A-Z` or `_`.                                                                                          */
    /*                   : => match `:` in string.                                                                                                                             */
    return path.replace(/:([a-zA-Z_][a-zA-Z0-9_]*)/g, (match, key) => {
      if (!params || !params[key]) {
        throw new Error(`Missing path parameter: ${key}`);
      }
      return encodeURIComponent(params[key].toString());
    });
  }

  private _buildEndpointUrl<E extends Endpoint>(
    path: E["path"],
    params: E["request"]["params"],
    query: E["request"]["query"],
  ) {
    let url: URL;
    if (params) {
      url = new URL(this.baseUrl.concat(this._replaceUrlParams(path, params)));
    } else {
      url = new URL(this.baseUrl.concat(path));
    }
    if (query) {
      Object.keys(query).forEach((key) =>
        url.searchParams.append(key, query[key].toString()),
      );
    }
    url.searchParams.append("pageSize", this._pageSize.toString());

    return url.toString();
  }

  private _buildEndpointHeaders<E extends Endpoint>(
    authToken: E["request"]["authToken"],
    rest?: Record<string, string>,
  ) {
    const headers: Record<string, string> = {};
    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }
    if (rest) {
      Object.assign(headers, rest);
    }
    return headers;
  }

  async do<E extends Endpoint>({
    method,
    path,
    data,
    query,
    params,
    authToken,
  }: EndpointParams<E>): Promise<E["response"]> {
    this._retryCount = 0;
    switch (method) {
      case "GET":
      case "DELETE":
      case "POST":
      case "PUT":
      case "PATCH": {
        const res = await this._fetch({
          url: this._buildEndpointUrl(path, params, query),
          method,
          headers: this._buildEndpointHeaders(authToken, {
            "Content-Type": "application/json",
          }),
          data,
        });
        return res.data;
      }
      default:
        throw new Error(`Unsupported method: ${method}`);
    }
  }

  protected refreshAccessToken:
    | (() => Promise<{ refreshToken: string }>)
    | undefined = undefined;
  private async _fetch(config: AxiosRequestConfig): Promise<AxiosResponse> {
    try {
      const res = await axios(config);
      if (res.status !== 200) {
        throw new RequestError({
          message: res.statusText,
          status: res.status,
          json: await res.data,
        });
      }
      return res;
    } catch (error) {
      if (this._withRetry < 1) throw error;

      this._retryCount += 1;
      if (this._retryCount > this._withRetry) {
        throw error;
      }

      if (error instanceof RequestError && error.status === 401) {
        if (this.refreshAccessToken) {
          await this.refreshAccessToken();
          return await this._fetch(config);
        } else {
          throw new NeedReLoginError("Need re-login");
        }
      } else {
        return await this._fetch(config);
      }
    }
  }
}
