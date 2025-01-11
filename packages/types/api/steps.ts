import { CardDeck, FinalField, Steps } from "../models";
import { Creation, Endpoint, Request, Response, Update } from "./core";

export interface GetUserStepsRequest extends Request {
  authToken: string;
}
export interface GetUserStepsResponse extends Response {
  data: {
    stepsList: Steps[];
    cardDeckList: CardDeck[];
    finalFieldList: FinalField[];
  };
}
export interface GetUserStepsEndpoint extends Endpoint {
  method: "GET";
  path: "/user-steps";
  request: GetUserStepsRequest;
  response: GetUserStepsResponse;
}
