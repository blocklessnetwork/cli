import { readFileSync } from "fs";
import Chalk from "chalk";
import FormData from "form-data";
import axios from "axios";
import { getToken } from "../../store/db";
import { IDeploymentOptions } from "./interfaces";
import { run as runBuild } from "./build";
import { createWasmArchive, getBuildDir, removeTrailingSlash } from "./shared";

const deploymentOptions: IDeploymentOptions = {
  functionId: "",
  functionName: "",
  userFunctionId: "",
};

const server = "https://wasi.bls.dev";
const token = getToken();

export const publishFunction = async (
  manifest: any,
  archive: any,
  cb?: Function
) => {
  const formData = new FormData();

  formData.append("manifest", manifest);
  formData.append("wasi_archive", archive);

  axios
    .post(`${server}/api/submit`, formData, {
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

const logResult = (data: any) => {
  const { cid } = data;
  console.log(`function successfully published with id ${cid}`);
};

export const run = (options: any) => {
  const {
    debug,
    name,
    path: givenPath = ".",
    publishCallback = logResult,
    rebuild,
  } = options;
  const path = removeTrailingSlash(givenPath); // deploy does this already but we can call publish from the CLI, so still needed here
  const buildDir = getBuildDir(path);
  const wasmName = `${name}${debug ? "-debug" : ""}.wasm`;
  const wasmArchive = `${name}.tar.gz`;
  const {
    bls: { functionId: userFunctionId },
  } = require(`${path}/package`);

  //TODO: this is absolutely monstrous and needssanity appplied
  deploymentOptions.userFunctionId = userFunctionId;

  if (rebuild) {
    runBuild({ debug, name, path, rebuild });
  }

  console.log(Chalk.yellow(`Creating tarball...`));
  createWasmArchive(buildDir, wasmArchive, wasmName);

  console.log(Chalk.yellow(`Deploying function located in ${buildDir}`));
  publishFunction(
    readFileSync(`${buildDir}/manifest.json}`),
    readFileSync(`${buildDir}/${wasmArchive}`),
    publishCallback
  );
};
