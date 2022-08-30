import { store } from "../../store";
import fs from "fs";
import { execSync } from "child_process";
import { run as runBuild } from "./build";

export const run = (options: any) => {
  const {
    systemPath = `${store.system.homedir}/.bls/`,
    cwd: path = process.cwd(),
    name,
  } = options;
  const runtimePath = `${systemPath}runtime/blockless-cli`;

  try {
    if (fs.existsSync(runtimePath)) {
      runBuild({
        path,
        name,
        debug: true,
        rebuild: false,
      });
      execSync(`${runtimePath} build/manifest.json`, {
        cwd: path,
        stdio: "inherit",
      });
    }
  } catch (err) {
    console.error(err);
  }
};
