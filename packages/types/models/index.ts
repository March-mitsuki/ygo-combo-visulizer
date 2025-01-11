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
