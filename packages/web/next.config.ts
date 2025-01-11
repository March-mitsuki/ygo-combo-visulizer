import type { NextConfig } from "next";
import yaml from "yaml";
import path from "path";
import fs from "fs";
import { z } from "zod";
import { webpack } from "next/dist/compiled/webpack/webpack";

const configSchema = z.object({
  baseUrl: z.string().url(),
});

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config) => {
    const configFilePath = path.resolve(
      __dirname,
      "..",
      "..",
      "config.env.yaml",
    );
    const allConfig = yaml.parse(fs.readFileSync(configFilePath, "utf-8"));
    const webConfig = configSchema.parse(allConfig.web);
    config.plugins.push(
      new webpack.DefinePlugin({
        "window.app": `{config:${JSON.stringify(webConfig)}}`,
      }),
    );
    return config;
  },
  experimental: {
    optimizePackageImports: ["@chakra-ui/react"],
  },
};

export default nextConfig;
