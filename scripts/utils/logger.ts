import { bgGreen, bgCyan, bgYellow, bgRed } from "picocolors";

export default {
  debug: (...args: any[]) => {
    console.log(bgGreen(" DEBUG "), ...args);
  },
  info: (...args: any[]) => {
    console.log(bgCyan(" INFO  "), ...args);
  },
  warn: (...args: any[]) => {
    console.log(bgYellow(" WARN  "), ...args);
  },
  error: (...args: any[]) => {
    console.log(bgRed(" ERROR "), ...args);
  },
};
