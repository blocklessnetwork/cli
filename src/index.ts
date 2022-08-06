import args from "args";
import Chalk from "chalk";
import { store, set as storeSet } from "./store";
import * as wallet from "./methods/wallet";
import { run as runInstall } from "./commands/offchain/install";
import { run as runStart } from "./commands/offchain/start";
import { run as runInit } from "./commands/function/init";
import pkg from "../package.json";

let didRun = false;
const name = "bls";
function printHelp(commands: any, options: any = []) {
  console.log(
    `  Usage: ${Chalk.yellow(name)} ${Chalk.green(
      "subcommand"
    )} [options] [command]`
  );
  console.log("");
  console.log("  Commands:");
  console.log("");
  for (const command of commands) {
    console.log(`       ${Chalk.green(command[0])}     ${command[1]}`);
  }

  console.log("");
  if (options.length > 0) console.log("  Options:");

  for (const option of options) {
    console.log(`       ${Chalk.yellow(option[0])}     ${option[1]}`);
  }
}

args
  .options([
    {
      name: "path",
      description: "The target path for the command",
      defaultValue: `${store.system.homedir}/.bls`,
    },
    { name: "name", description: "The target name for the command" },
  ])
  .command(
    "offchain",
    "Interact with local off-chain network [install, start, configure]",
    async (name: string, sub: string[]) => {
      didRun = true;
      if (!sub[0] || sub[0] === "help") {
        printHelp([
          ["install", "install the off-chain agent"],
          ["start  ", "start the off-chain agent"],
        ]);
        return;
      }
      switch (sub[0]) {
        case "install":
          runInstall();
          break;
        case "start":
          runStart();
          break;
      }
    }
  )
  // .command(
  //   "runtime",
  //   "Interact with installed Blockless Runtimes [list, install, remove]",
  //   () => {
  //     didRun = true;
  //   }
  // )
  .command("info", "Information about the local Blockless environment", () => {
    didRun = true;
    console.log(
      Chalk.green(`                                                 
            *%%%%%%%%%.         
        (%%%%%%*   #%%%%%%*     
     #%%%%%##  %%%%#   (%%%%%(  
    (%%%  (%%#   #%%%%%%  (%%%, 
    (%%%  %%%%%%%%   /%%%  %%%* 
    (%%%  %%%  %%%%%%%   .%%%%* 
    (%%%  %%%  %%#   #%%%  %%%* 
    (%%%. ,%%  %%%%%%%%#  #%%%, 
     #%%%%%##  #%%%/   #%%%%%,  
        ,%%%%%%(  *%%%%%%%      
            #%%%%%%%#`)
    );
    console.log("");
    console.log(Chalk.greenBright("  Blockless Runtime Environment"));
    console.log("");
    console.log(`  ${Chalk.yellow("CLI Version:")} ${pkg.version}`);
    console.log(`  ${Chalk.yellow("Platform:")} ${store.system.platform}`);
    console.log(`  ${Chalk.yellow("Architecture:")} ${store.system.arch}`);
    console.log(
      `  ${Chalk.yellow("Base directory:")} ${store.system.homedir}/.bls`
    );
    console.log(
      `  ${Chalk.yellow("Runtime Library:")} ${
        store.system.homedir
      }/.bls/runtime`
    );
    console.log(
      `  ${Chalk.yellow("Networking Library:")} ${
        store.system.homedir
      }/.bls/network`
    );
  })
  .command(
    "wallet",
    "Interact with the Blockless blockchain [import, list, remove, create, balance, send]",
    async (name: string, sub: string[]) => {
      if (sub[0]) {
        didRun = true;
        const method = (wallet as any)[`${sub[0]}Wallet`];
        if (method) await method();
      }
    }
  )
  .command(
    "function",
    "Interact with Functions [init, invoke, delete, list]",
    (name: string, sub: string[], options) => {
      didRun = true;

      if (!sub[0] || sub[0] === "help" || !("name" in options)) {
        printHelp(
          [["init", "initialize a new function with @blockless/app"]],
          [
            ["-n, --name", "the name of the function to initialize (required)"],
            [
              "-p, --path",
              `the location to initialize the function (optional; defaults to  ${store.system.homedir}/.bls)`,
            ],
          ]
        );
        return;
      }
      switch (sub[0]) {
        case "init":
          runInit(options);
          break;

        default:
          break;
      }

      console.log(name, sub);
    },
    ["add", "create", "initialize"]
  )
  .command("console", "Open the Blockless console in browser", () => {
    didRun = true;
  });

export async function cli() {
  const flags = args.parse(process.argv, {
    name: name,
    version: false,
  } as any);
  if (!didRun) args.showHelp();
}
