import { defineConfig, PluginOption } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import yaml from "yaml";
import fs from "fs";
import path from "path";
import { z } from "zod";

const configSchema = z.object({
  baseUrl: z.string().url(),
});

const yamlConfig = (): PluginOption => {
  let globalInjection = "";
  const configFilePath = path.resolve(__dirname, "..", "..", "config.env.yaml");

  return {
    name: "vite-yaml-config",
    configResolved() {
      const allConfig = yaml.parse(fs.readFileSync(configFilePath, "utf-8"));
      const adminConfig = configSchema.parse(allConfig.admin);
      globalInjection = `window.app={config:${JSON.stringify(adminConfig)}};`;
    },
    transformIndexHtml(html) {
      return html.replace(
        "<head>",
        `<head><script>${globalInjection}</script>`,
      );
    },
  };
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths(), yamlConfig()],
});
