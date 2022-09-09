import { execSync } from "child_process";
import Chalk from "chalk";
import { store } from "../store";

export const activateRuntime = () => {
  const os =
    store.system.platform === "win32"
      ? "windows"
      : store.system.platform === "darwin"
      ? "macos"
      : "linux";

  console.log(`${Chalk.yellow("Activating")} ... runtime: ${os}`);
  execSync(`rm -rf ${store.system.homedir}/.bls/network/runtime`, {
    stdio: "ignore",
  });

  console.log(`${Chalk.green("Runtime")} ... activating runtime: ${os}`);
  execSync(
    `cp -r ${store.system.homedir}/.bls/runtime ${store.system.homedir}/.bls/network`,
    {
      stdio: "ignore",
    }
  );

  console.log(`${Chalk.green("Runtime")} ... activated runtime: ${os}`);
};
