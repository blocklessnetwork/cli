import { existsSync, writeFileSync } from "fs";
import Chalk from "chalk";
import { execSync } from "child_process";
import { IManifest } from "./interfaces";
import fs from "fs";

const createManifest = (
  buildDir: string,
  entry: string,
  url: string
): IManifest => {
  const name = entry.split(".")[0];
  const manifest: IManifest = {
    id: "",
    name,
    description: "",
    fs_root_path: "./",
    entry,
    runtime: {
      checksum: "",
      url,
    },
  };
  return manifest;
};

export const run = (options: {
  debug: boolean;
  name: string;
  path: string;
  rebuild: boolean;
}) => {
  const { debug, name, path, rebuild } = options;
  // check for and store unmodified wasm file name to change later
  const buildDir = `${path}/build`;
  const wasmName = `${name}${debug ? "-debug" : ""}.wasm`;
  const wasmArchive = `${name}.tar.gz`;
  const wasmManifest = createManifest(buildDir, wasmName, wasmArchive);

  const build = () => {
    console.log(Chalk.green(`Building function ${name} in ${buildDir}...`));
    execSync(`npm run build:${debug ? "debug" : "release"};`, {
      cwd: path,
      stdio: "inherit",
    });
  };

  try {
    if (!fs.existsSync(`${buildDir}/${wasmName}`)) build();
  } catch (err) {
    build();
  }

  if (rebuild) build();

  writeFileSync(`${buildDir}/manifest.json`, JSON.stringify(wasmManifest));
};
