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
  posts?: Post;
  profile?: Profile;
};
export type Post = {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  title: string;
  content: string;
  author: User;
};
export type Profile = {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  blogLink: string;
  user: User;
};
