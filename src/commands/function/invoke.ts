import { store } from "../../store";
import fs from "fs";
import { execSync } from "child_process";
import { run as runBuild } from "./build";

export const run = (options: any) => {
  const { systemPath = `${store.system.homedir}/.bls/`, cwd = process.cwd() } =
    options;
  const runtimePath = `${systemPath}runtime/blockless-cli`;

  try {
    if (fs.existsSync(runtimePath)) {
      runBuild({
        path: cwd,
        debug: true,
        rebuild: false,
      });
      execSync(`${runtimePath} ${cwd}/build/manifest.json`, {
        stdio: "inherit",
      });
    }
  } catch (err) {
    console.error(err);
  }
};
