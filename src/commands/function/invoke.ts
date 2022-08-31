import { store } from "../../store";
import fs from "fs";
import { execSync } from "child_process";
import { run as runBuild } from "./build";

export const run = (options: any) => {
  const {
    systemPath = `${store.system.homedir}/.bls/`,
    cwd: path = process.cwd(),
    name,
    rebuild = true,
  } = options;
  const runtimePath = `${systemPath}runtime/blockless-cli`;

  try {
    if (fs.existsSync(runtimePath)) {
      runBuild({
        path,
        name,
        debug: true,
        rebuild,
      });

      // the runtime requires absolute paths
      let manifestData = fs.readFileSync(`${path}/build/manifest.json`, "utf8");
      let manifest = JSON.parse(manifestData);
      manifest.entry = `${path}/build/${manifest.entry}`;
      fs.writeFileSync(`${path}/build/manifest.json`, JSON.stringify(manifest));

      // pass in stdin to the runtime
      execSync(`echo "" | ${runtimePath} build/manifest.json`, {
        cwd: path,
        stdio: "inherit",
      });
    }
  } catch (err) {
    console.error(err);
  }
};
