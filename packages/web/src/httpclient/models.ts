import { ModelHttpClient } from "@qupidjs/httpclient";
import { CardDeck, FinalField, Steps, User } from "@qupidjs/types/models";

export const stepsClient = new ModelHttpClient<Steps>({
  baseUrl: window.app.config.baseUrl,
  prefix: "/steps",
});

export const cardDeckClient = new ModelHttpClient<CardDeck>({
  baseUrl: window.app.config.baseUrl,
  prefix: "/carddeck",
});

export const finalFieldClient = new ModelHttpClient<FinalField>({
  baseUrl: window.app.config.baseUrl,
  prefix: "/finalfield",
});

export const userClient = new ModelHttpClient<User>({
  baseUrl: window.app.config.baseUrl,
  prefix: "/user",
});
