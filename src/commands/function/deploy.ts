import { existsSync, readFileSync, writeFileSync } from "fs";
import { createHash, BinaryToTextEncoding } from "crypto";
import Chalk from "chalk";
import { execSync } from "child_process";
import FormData from "form-data";
import { getToken } from "../../store/db";
import axios from "axios";
import { IDeploymentOptions, IManifest } from "./interfaces";

const consoleServer = getConsoleServer();
const token = getToken();

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
): IManifest => {
  const name = entry.split(".")[0];
  const manifest: IManifest = {
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
  execSync(`mv ${oldName} ${newName}`, { cwd: path, stdio: "inherit" });
};

const publishFunction = async (manifest: any, archive: any, cb?: Function) => {
  const formData = new FormData();

  formData.append("manifest", manifest);
  formData.append("wasi_archive", archive);

  axios
    .post(`${wasiServer}/api/submit`, formData, {
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
      console.log("error publishing function", error);
    });
};

//TODO: make this a lot better.
const deployFunction = (data: any) => {
  const { cid: functionId, name: functionName } = data;
  const { userFunctionId } = deploymentOptions;
  axios
    .post(
      `${consoleServer}/api/modules/deploy`,
      {
        functionId,
        functionName,
        userFunctionId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .then((res) => {
      console.log(res);
    })
    .catch((error) => {
      console.log("error publishing function", error);
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

  if (rebuild) {
    console.log(Chalk.green(`Building function ${name} in ${buildDir}...`));
    execSync(
      `npm run build:${debug ? "debug" : "release"}; ${renameWasm(
        buildDir,
        defaultWasm,
        wasmName
      )}`,
      { cwd: path, stdio: "inherit" }
    );
  } else if (existsSync(`${buildDir}`)) {
    if (existsSync(`${buildDir}/${defaultWasm}`)) {
      renameWasm(buildDir, defaultWasm, wasmName);
    }
  } else {
    console.log(
      Chalk.red(`Could not access ${buildDir}.  Has the function been built?`)
    );
  }

  console.log(Chalk.yellow(`Creating tarball...`));
  execSync(`tar zcf ${wasmArchive} ${wasmName}`, {
    cwd: buildDir,
    stdio: "inherit",
  });

  console.log(Chalk.yellow(`Creating manifest...`));
  writeFileSync(
    `${buildDir}/manifest.json`,
    JSON.stringify(createManifest(buildDir, wasmName, wasmArchive))
  );

  console.log(Chalk.yellow(`Deploying function located in ${buildDir}`));
  publishFunction(
    readFileSync(`${buildDir}/manifest.json`),
    readFileSync(`${buildDir}/${wasmArchive}`),
    deployFunction
  );
};
