import path from "path";
import fs from "fs";

export type GetFileOptions = {
  defaultPath?: string;
  defaultFilepath?: string;
  pathlike?: string;
};

export const getFileSync = (param: GetFileOptions) => {
  return fs.readFileSync(getFilepath(param), "utf8");
};

export const getFilepath = ({
  defaultPath,
  defaultFilepath,
  pathlike,
}: GetFileOptions) => {
  let filepath: string;
  if (!pathlike) {
    if (defaultPath) {
      filepath = defaultPath;
    } else if (defaultFilepath) {
      filepath = path.join(process.cwd(), defaultFilepath);
    } else {
      throw new Error("No file path provided");
    }
  } else {
    if (path.isAbsolute(pathlike)) {
      filepath = pathlike;
    } else {
      filepath = path.join(process.cwd(), pathlike);
    }
  }
  return filepath;
};
