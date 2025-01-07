import yaml from "yaml";
import fs from "fs";
import path from "path";

export const loadConfig = () => {
  return yaml.parse(
    fs.readFileSync(path.resolve(process.cwd(), "config.env.yaml"), "utf-8"),
  );
};
