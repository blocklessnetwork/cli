import { readFileSync } from "fs";
import Chalk from "chalk";
import FormData from "form-data";
import axios from "axios";
import { getDb, getToken } from "../../store/db";
import { run as runBuild } from "./build";
import { resolve } from "path";
import { getGatewayUrl, getWASMRepoServer } from "../../lib/urls";
import { parseBlsConfig } from "../../lib/blsConfig"
import { logger } from "../../lib/logger"
import { slugify } from "../../lib/strings"

export const publishFunction = async (
  manifest: any,
  archive: any,
  archiveName: string,
  cb?: Function
) => {
  const formData = new FormData();

  formData.append("manifest", manifest, "manifest.json");
  formData.append("wasi_archive", archive, archiveName);
  
  try {
    const gatewayUrl = getGatewayUrl();
    const wasmRepoUrl = getWASMRepoServer();
    const token = getToken();
    const gatewayVersion = getDb().get("config.apiVersion").value();
    const url =
      gatewayVersion === 1
        ? `${gatewayUrl}/api/v1/registry`
        : `${wasmRepoUrl}/api/submit`;

    const res = await axios.post(url, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    console.log(Chalk.green("Publish successful!"));
    console.log("");

    if (cb) {
      cb(res.data);
    }
  } catch (error: any) {
    logger.error("Failed to publish function.", error.message);
  }
};

const logResult = (data: any) => {
  const { cid } = data;
  console.log(`Function successfully published with id ${cid}`);
};
export const run = (options: any) => {
  const {
    debug = true,
    path = process.cwd(),
    publishCallback = logResult,
    rebuild,
  } = options;
  
  // Fetch BLS config
  const { name, build, build_release } = parseBlsConfig()
  const buildConfig = !debug ? build_release : build
  const buildName = buildConfig.entry ? slugify(buildConfig.entry.replace('.wasm', '')) : slugify(name)
  const buildDir = resolve(path, buildConfig.dir || 'build')
  const wasmArchive = `${slugify(buildName)}.tar.gz`

  // Run the build command
  runBuild({ debug, path, rebuild });

  console.log(`${Chalk.yellow('Publishing:')} function located in ${buildDir}`);

  publishFunction(
    readFileSync(resolve(buildDir, 'manifest.json')),
    readFileSync(resolve(buildDir, wasmArchive)),
    wasmArchive,
    publishCallback
  );
};
