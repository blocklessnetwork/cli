import { execSync } from "child_process";
import Chalk from "chalk";
import { store } from "../store";

export const generateKey = () => {
  const os =
    store.system.platform === "win32" ? "windows" : store.system.platform;

  const platform =
    store.system.platform === "darwin" ? store.system.arch : "x64";

  console.log(
    `${Chalk.yellow("Generating")} ... identity key in ${
      store.system.homedir
    }/.bls/network/keys`
  );
  execSync(
    `mkdir -p ${store.system.homedir}/.bls/network/keys; cd ${store.system.homedir}/.bls/network/keys; ${store.system.homedir}/.bls/network/txkeygen-${os}-${platform}`,
    {
      stdio: "ignore",
    }
  );
};
