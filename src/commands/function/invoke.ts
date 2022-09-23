import { store } from "../../store";
import fs from "fs";
import { execSync } from "child_process";
import { run as runBuild } from "./build";
import { basename, resolve } from "path";

export const run = (options: any) => {
  const {
    systemPath = `${store.system.homedir}/.bls/`,
    cwd: path = process.cwd(),
    name = basename(resolve(process.cwd())),
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

      // prepare environment variables
      // pass environment variables to bls runtime
      let envString = ''

      if (!!options.env) {
        let envVars = [] as string[]
        let envVarsKeys = [] as string[]

        // Validate environment variables
        const vars = typeof options.env === 'string' ? [options.env] : options.env
        vars.map((v: string) => {
          const split = v.split('=')
          if (split.length !== 2) return
          
          envVars.push(v)
          envVarsKeys.push(split[0])
        })

        // Include environment string if there are variables
        if (envVars.length > 0) {
          envString = `env ${envVars.join(' ')} BLS_LIST_VARS=\"${envVarsKeys.join(';')}\"`
        }
      }

      // pass in stdin to the runtime
      execSync(`echo "" | ${envString} ${runtimePath} build/manifest.json`, {
        cwd: path,
        stdio: "inherit",
      });
    }
  } catch (err) {
    console.error(err);
  }
};
