export type JsonData = Record<string, unknown> | unknown[];
export type PagenationResult<T> = {
  total: number;
  count: number;
  next: string | null;
  results: T[];
};
export type Creation<T extends JsonData> = Omit<
  T,
  "id" | "createdAt" | "updatedAt"
>;
export type Update<T extends JsonData> = Partial<Creation<T>>;
export type Upsert<T extends JsonData> = Creation<T> & {
  id?: number;
};

export enum ResponseCode {
  Success = 2000,
  Created = 2001,
  NoContent = 2004,
  BadRequest = 4000,
  Unauthorized = 4001,
  Forbidden = 4003,
  NotFound = 4004,
  Conflict = 4009,
  InternalServerError = 5000,
}

export interface Request {
  data?: unknown;
  query?: Record<string, string | number>;
  params?: Record<string, string | number>;
  authToken?: string;
}
export interface Response {
  data: unknown;
  code: ResponseCode;
}
export interface Endpoint {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  request: Request;
  response: Response;
}
