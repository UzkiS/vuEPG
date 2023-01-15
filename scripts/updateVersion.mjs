import { writeFileSync, readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const loadJSON = (path) =>
  JSON.parse(readFileSync(new URL(path, import.meta.url)));

const config = loadJSON("../package.json");

const fileName = fileURLToPath(import.meta.url);

const rootPath = path.dirname(path.dirname(fileName));

const configPath = path.join(rootPath, "src", "config", "version.ts");

writeFileSync(
  configPath,
  `export const PACKAGE_VERSION = "${config.version}";`
);
