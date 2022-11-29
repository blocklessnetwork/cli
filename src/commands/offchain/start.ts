import Chalk from "chalk";
import { store, get as storeGet, set as storeSet } from "../../store";
import { execSync } from "child_process";

export const run = (agentType: string = 'head') => {
  let config = './head-config.yaml'
  let type = 'head'

  switch (agentType) {
    case 'worker':
      type = 'worker'
      config = './worker-config.yaml'
      break;
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
