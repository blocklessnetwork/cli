import { execSync } from "child_process";
import Chalk from "chalk";
import { store } from "../store";

export const generateKey = () => {
  const os =
    store.system.platform === "win32" ? "windows" : store.system.platform;

  const arch = store.system.arch;

  console.log(
    `${Chalk.yellow("Generating")} ... identity key in ${
      store.system.homedir
    }/.bls/network/keys`
  );
  execSync(
    `mkdir -p ${store.system.homedir}/.bls/network/keys; cd ${store.system.homedir}/.bls/network/keys; ${store.system.homedir}/.bls/network/txkeygen-${os}-${arch}`,
    {
      stdio: "ignore",
    }
  );
};
