import { z } from "zod";
import { program } from "commander";
import { spawnSync } from "child_process";
import path from "path";
import fs from "fs";
import { models } from "@server/db/models";

import { genPrismaSchema } from "./schema_gen";
import { genModelsType } from "./types_gen";
import { loadConfig } from "../utils/loadconfig";
import logger from "../utils/logger";

const config = loadConfig();
const optionsSchema = z.object({
  name: z.string(),
  generateOnly: z.boolean().default(false),
});

program
  .option("-n, --name <name>", "migration name")
  .option(
    "-g, --generate-only",
    "Only generate types and prisma.schema file. Do not run `prisma schmea dev` automatically.",
  )
  .parse(process.argv);

function validateOptions() {
  const result = optionsSchema.safeParse(program.opts());
  if (!result.success) {
    logger.error("Invalid option", result.error.errors);
    process.exit(1);
  }
  return result.data;
}

async function writePrismaSchema() {
  const prismaSchemaPath = path.resolve(
    process.cwd(),
    "packages",
    "server",
    "prisma",
    "schema.prisma",
  );
  const schemaSourceCode = await genPrismaSchema(models, {
    provider: config.server.db.provider,
    url: config.server.db.url,
  });
  fs.writeFileSync(prismaSchemaPath, schemaSourceCode);
  logger.info("Write prisma schema to", prismaSchemaPath);
}

function runPrismaMigrateDev(name: string) {
  spawnSync("pnpm", ["prisma", "migrate", "dev", "--name", name], {
    stdio: "inherit",
    cwd: path.resolve(process.cwd(), "packages", "server"),
  });
}

async function writeTypes() {
  const modelTypesPath = path.resolve(
    process.cwd(),
    "packages",
    "types",
    "models",
    "index.ts",
  );
  const typesSourceCode = await genModelsType(models);
  fs.writeFileSync(modelTypesPath, typesSourceCode);
  logger.info("Write types to", modelTypesPath);
}

async function main() {
  logger.info("Start migrate prisma schema");

  const { name, generateOnly } = validateOptions();
  await writePrismaSchema();
  await writeTypes();
  if (!generateOnly) {
    runPrismaMigrateDev(name);
  }

  logger.info("Done");
}

main();
