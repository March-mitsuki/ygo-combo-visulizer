import { z } from "zod";
import yaml from "yaml";
import { getFileSync } from "./file";
import path from "path";

const serverConfigSchema = z.object({
  db: z.object({
    provider: z.coerce.string(),
    url: z.coerce.string(),
    maxPageSize: z.coerce.number().default(100),
  }),
  port: z.number().safe().int(),
});

export const loadConfig = () => {
  const config = yaml.parse(
    getFileSync({
      pathlike: path.resolve(
        __dirname,
        "..",
        "..",
        "..",
        "..",
        "config.env.yaml",
      ),
    }),
  );
  const serverConfig = serverConfigSchema.parse(config.server);

  // eslint-disable-next-line
  // @ts-ignore
  if (!process.app) process.app = {};
  process.app.config = serverConfig;
};
