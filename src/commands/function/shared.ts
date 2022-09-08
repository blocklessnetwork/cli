import { execSync } from "child_process";
import { readFileSync } from "fs";

export const getBuildDir = (path: string) => `${path}/build`;

export const createWasmArchive = (
  path: string,
  wasmArchive: string,
  wasmName: string
) => {
  console.log(`Creating archive ${wasmArchive} from ${wasmName} in ${path}...`);
  execSync(`cd ${path} && tar zcf ./${wasmArchive} -C ${path} ${wasmName}`, {
    cwd: path,
    stdio: "ignore",
  });

  return readFileSync(`${path}/${wasmArchive}`);
};
