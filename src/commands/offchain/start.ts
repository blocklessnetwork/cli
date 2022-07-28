import Chalk from "chalk";
import { store, get as storeGet, set as storeSet } from "../../store";
import { execSync } from "child_process";

export const run = () => {
  const os =
    store.system.platform === "win32" ? "windows" : store.system.platform;

  const arch = store.system.arch;

  console.log(`${Chalk.yellow("Off-Chain")} ... starting coordinator node`);
  execSync(
    `cd ${store.system.homedir}/.bls/network; ./txnode-${os}-${arch} -c ${store.system.homedir}/.bls/network/coordinator.yaml & ./txnode-${os}-${arch} -c ${store.system.homedir}/.bls/network/worker.yaml`,
    {
      stdio: "inherit",
    }
  );
};
