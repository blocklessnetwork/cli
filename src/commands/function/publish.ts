import { readFileSync } from "fs";
import Chalk from "chalk";
import FormData from "form-data";
import axios from "axios";
import { getToken } from "../../store/db";
import { IDeploymentOptions } from "./interfaces";
import { run as runBuild } from "./build";
import { createWasmArchive, getBuildDir } from "./shared";

const deploymentOptions: IDeploymentOptions = {
  functionId: "",
  functionName: "",
  userFunctionId: "",
};

const server = "https://wasi.bls.dev";
// const server = "http://127.0.0.1:3000";
const token = getToken();

export const publishFunction = async (
  manifest: any,
  archive: any,
  archiveName: string,
  cb?: Function
) => {
  const formData = new FormData();

  formData.append("manifest", manifest, "manifest.json");
  formData.append("wasi_archive", archive, archiveName);

  axios
    .post(`${server}/api/submit`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
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

const logResult = (data: any) => {
  const { cid } = data;
  console.log(`function successfully published with id ${cid}`);
};
export const run = (options: any) => {
  const {
    debug,
    name,
    path = process.cwd(),
    publishCallback = logResult,
    rebuild,
  } = options;
  const buildDir = getBuildDir(path);
  const wasmName = `${name}${debug ? "-debug" : ""}.wasm`;
  const wasmArchive = `${name}.tar.gz`;
  const {
    bls: { functionId: userFunctionId },
  } = require(`${path}/package`);

  //TODO: this is absolutely monstrous and needssanity appplied
  deploymentOptions.userFunctionId = userFunctionId;
  runBuild({ debug, name, path, rebuild });

  console.log(Chalk.yellow(`Publishing function located in ${buildDir}`));
  publishFunction(
    readFileSync(`${buildDir}/manifest.json`),
    readFileSync(`${buildDir}/${wasmArchive}`),
    wasmArchive,
    publishCallback
  );
};
