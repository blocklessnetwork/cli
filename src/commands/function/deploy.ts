import { existsSync, readFileSync, writeFileSync } from "fs";
import { createHash, BinaryToTextEncoding } from "crypto";
import Chalk from "chalk";
import { execSync } from "child_process";
import FormData from "form-data";
import { getDb } from "../../store/db";
import axios from "axios";

interface WasmMethod {
  name: string;
  entry: string;
  result_type: string;
}

interface Manifest {
  id: string;
  name: string;
  description: string;
  fs_root_path: string;
  limited_fuel?: number;
  limited_memory?: number;
  entry: string;
  runtime: {
    checksum: string;
    url: string;
  };
  resources?: string[];
  methods?: WasmMethod[];
}

const host =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3005"
    : "https://wasi.bls.dev";

const getTokenFromStore = () => {
  const db = getDb();
  const { token } = db.get("config").value();
  return token;
};

const createChecksum = ({
  digest = "hex",
  filePath = "",
  hash = "sha256",
}): string => {
  console.log(Chalk.yellow(`Creating hash...`));
  const sha = createHash(hash);
  const fileBuffer = readFileSync(`${filePath}`);
  sha.update(fileBuffer);
  return sha.digest(digest as BinaryToTextEncoding);
};

const createManifest = (
  buildDir: string,
  entry: string,
  url: string
): Manifest => {
  const name = entry.split(".")[0];
  const manifest: Manifest = {
    id: "",
    name,
    description: "",
    fs_root_path: "./",
    entry,
    runtime: {
      checksum: createChecksum({ filePath: `${buildDir}/${url}` }),
      url,
    },
  };
  return manifest;
};

const renameWasm = (path: string, oldName: string, newName: string) => {
  execSync(`mv ${path}/${oldName} ${path}/${newName}`, { stdio: "inherit" });
};

const deployWasm = async (manifest: any, archive: any, cb?: Function) => {
  const formData = new FormData();
  const token = await getTokenFromStore();

  formData.append("manifest", manifest);
  formData.append("wasi_archive", archive);

  axios
    .post(`${host}/api/modules/deploy`, formData, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    })
    .then((res) => {
      if (cb) {
        cb(res.data);
      }
    })
    .catch((error) => {
      console.log("error deploying function", error);
    });
};

export const run = (options: any) => {
  const { debug, path, rebuild } = options;
  // check for and store unmodified wasm file name to change later
  const defaultWasm = debug ? "debug.wasm" : "release.wasm";
  const buildDir = `${path}/build`;
  const pathParts = path.split("/");
  const name = pathParts.pop();
  const wasmName = `${name}.wasm`;
  const wasmArchive = `${name}.tar.gz`;
  const wasmManifest = createManifest(buildDir, wasmName, wasmArchive);

  if (rebuild) {
    console.log(Chalk.green(`Building function ${name} in ${buildDir}...`));
    execSync(
      `cd ${path}; npm run build:${debug ? "debug" : "release"}; ${renameWasm(
        buildDir,
        defaultWasm,
        wasmName
      )}`,
      {
        stdio: "inherit",
      }
    );
  } else {
    if (existsSync(`${buildDir}/${defaultWasm}`)) {
      renameWasm(buildDir, defaultWasm, wasmName);
    }
  }
  console.log(Chalk.yellow(`Creating tarball...`));
  execSync(`cd ${buildDir}; tar zcf ${wasmArchive} ${wasmName}`, {
    stdio: "inherit",
  });

  console.log(Chalk.yellow(`Creating manifest...`));
  writeFileSync(`${buildDir}/manifest.json`, JSON.stringify(wasmManifest));

  console.log(Chalk.yellow(`Deploying function located in ${buildDir}`));
  deployWasm(
    readFileSync(`${buildDir}/manifest.json`),
    readFileSync(`${buildDir}/${wasmArchive}`)
  );
};
