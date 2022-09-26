import fs from "fs";
import { store } from "../../store";
import { execSync } from "child_process";
import { run as runBuild } from "./build";
import { basename, resolve } from "path";
import { parseBlsConfig } from "../../lib/blsConfig"

export const run = (options: any) => {
  const {
    systemPath = `${store.system.homedir}/.bls/`,
    cwd: path = process.cwd(),
    name = basename(resolve(process.cwd())),
    debug = true,
    rebuild = true,
  } = options;
  const runtimePath = `${systemPath}runtime/blockless-cli`;

  try {
    if (fs.existsSync(runtimePath)) {
      // Fetch BLS config
      const { build, build_release } = parseBlsConfig()

      // Execute the build command
      runBuild({ path, debug, rebuild });

      // check for and store unmodified wasm file name to change later
      const buildConfig = !debug ? build_release : build
      const buildDir = resolve(path, buildConfig.dir || 'build')
      const manifestPath = resolve(buildDir, 'manifest.json')
      
      // the runtime requires absolute paths
      let manifestData = fs.readFileSync(manifestPath, "utf8");
      let manifest = JSON.parse(manifestData);
      manifest.entry = resolve(buildDir, manifest.entry)
      fs.writeFileSync(manifestPath, JSON.stringify(manifest));

      // pass in stdin to the runtime
      execSync(`echo "" | ${runtimePath} ${manifestPath}`, {
        cwd: path,
        stdio: "inherit",
      });
    }
  } catch (err) {
    console.error(err);
  }
};
