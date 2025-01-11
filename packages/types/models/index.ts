import { JsonData } from "../api";
export type User = {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  email: string;
  username: string;
  nickname?: string;
  password: string;
  age?: number | null;
};
export type CardDeck = {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
  name: string;
};
export type FinalField = {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  cardDeckId: number;
};
export type Steps = {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  cardDeckId: number;
  finalFieldId: number;
  data: string;
};
