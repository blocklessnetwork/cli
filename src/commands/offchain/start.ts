import Chalk from "chalk";
import { store, get as storeGet, set as storeSet } from "../../store";
import { execSync } from "child_process";

export const run = (options: any, sub: string[]) => {
  let config = './head-config.yaml'
  let type = 'head'

  if (sub.length > 1 && sub[1]) {
    switch (sub[1]) {
      case 'worker':
        type = 'worker'
        config = './worker-config.yaml'
        break;
    }
  }

  console.log(`${Chalk.yellow("Off-Chain")} ... starting ${type} node`);

  try {
    execSync(
      `cd ${store.system.homedir}/.bls/network; ./b7s --config=${config}`,
      {
        stdio: "inherit",
      }
    );
    process.exit(0)
  } catch (error) {
    process.exit(0)
  }
};
