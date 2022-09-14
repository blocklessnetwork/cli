import { existsSync, writeFileSync } from "fs";
import Chalk from "chalk";
import { execSync } from "child_process";
import { IManifest } from "./interfaces";
import { createWasmArchive, getBuildDir } from "./shared";
import { basename } from "path";
import fs from "fs";
import crypto from "crypto";

const createManifest = (
  buildDir: string,
  entry: string,
  url: string,
  manifestOverride: any
): IManifest => {
  const name = entry.split(".")[0];
  const manifest: IManifest = {
    id: "",
    name,
    hooks: [],
    description: "",
    fs_root_path: "./",
    entry,
    runtime: {
      checksum: "",
      url,
    },
    contentType: "json",
    methods: [],
    ...manifestOverride,
  };
  return manifest;
};

export const run = (options: {
  debug: boolean;
  name: string;
  path: string;
  rebuild: boolean;
  manifest?: any;
}) => {
  const {
    debug = false,
    name = basename(process.cwd()),
    path = process.cwd(),
    rebuild = false,
    manifest = {},
  } = options;
  // check for and store unmodified wasm file name to change later
  const defaultWasm = debug ? "debug.wasm" : "release.wasm";
  const buildDir = `${path}/build`;
  const wasmName = `${name}${debug ? "-debug" : ""}.wasm`;
  const wasmArchive = `${name}.tar.gz`;

  const wasmManifest = createManifest(
    buildDir,
    wasmName,
    wasmArchive,
    manifest
  );

  const renameWasm = (path: string, oldName: string, newName: string) => {
    execSync(`mv ${oldName} ${newName}`, { cwd: path, stdio: "inherit" });
  };

  const build = () => {
    console.log(Chalk.green(`Building function ${name} in ${buildDir}...`));
    execSync(`npm i; npm run build:${debug ? "debug" : "release"};`, {
      cwd: path,
      stdio: "inherit",
    });

    if (existsSync(`${buildDir}/${defaultWasm}`)) {
      renameWasm(buildDir, defaultWasm, wasmName);
    }
  };

  try {
    if (!fs.existsSync(`${buildDir}/${wasmName}`) || rebuild) build();
  } catch (err) {
    build();
  }

  const archive = createWasmArchive(buildDir, wasmArchive, wasmName);
  const hash = crypto.createHash("md5").update(archive).digest("hex");
  wasmManifest.runtime.checksum = hash;
  wasmManifest.methods?.push({
    name: wasmName.split(".")[0],
    entry: wasmName,
    result_type: "string",
  });

  writeFileSync(`${buildDir}/manifest.json`, JSON.stringify(wasmManifest));
};
