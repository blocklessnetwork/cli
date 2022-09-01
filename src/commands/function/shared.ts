import { execSync } from "child_process";
import { readFileSync } from "fs";

export const getBuildDir = (path: string) => `${path}/build`;

export const createWasmArchive = (
  path: string,
  wasmArchive: string,
  wasmName: string
) => {
  execSync(`tar zcf ${path}/${wasmArchive} ${path}/${wasmName}`, {
    cwd: path,
    stdio: "inherit",
  });
  return readFileSync(`${path}/${wasmArchive}`);
};
