import args from "args";
import Chalk from "chalk";
import { store, set as storeSet } from "./store";
import * as wallet from "./methods/wallet";

import { run as runInstall } from "./commands/offchain/install";
import { run as runStart } from "./commands/offchain/start";
import { run as runInit } from "./commands/function/init";
import { run as runDeploy } from "./commands/function/deploy";
import { run as runInvoke } from "./commands/function/invoke";
import { run as runLogin } from "./commands/login";

let didRun = false;
let pkg = { version: "0.0.0" };
const name = "bls";

function printHelp(commands: any = [], options: any = []) {
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
    { name: "name", description: "The target name for the command" },
    {
      name: "path",
      description: "The target path for the command",
    },
    {
      name: "private",
      description:
        "For functions, setting this will mark the function as private",
    },
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
    "Interact with Functions [init, invoke, delete, deploy, list]",
    (name: string, sub: string[], options) => {
      interface RequiredOptions {
        init: string[];
        deploy: string[];
      }
      const requiredOptions: RequiredOptions = {
        init: ["name"],
        deploy: ["name", "path"],
      };
      const index: keyof RequiredOptions = "init";
      didRun = true;
      if (!sub[0] || sub[0] === "help") {
        printHelp([
          ["init\t", "initialize a new function with @blockless/app"],
          ["deploy\t", "deploy a function on Blockless"],
        ]);
        return;
      }
      switch (sub[0]) {
        case "init":
          if (!("name" in options)) {
            console.log(
              Chalk.red(`Missing required option ${Chalk.yellow("name")}\n`)
            );
            printHelp(
              [
                [
                  "init",
                  "Initialize a new function with @blockless/app and save it to Console.",
                ],
              ],
              [
                [
                  "--name",
                  "The name of the function to initialize.  This name will be used in the package's configuration file (i.e. package.json). (required)",
                ],
                [
                  "--path",
                  `The location to initialize the function (optional; defaults to  ${store.system.homedir}/.bls)`,
                ],
                [
                  "--private",
                  "If set, this function will not be made available for others to consume (optional; defaults to undefined)",
                ],
              ]
            );
            return;
          } else {
            runInit(options);
          }
          break;
        case "deploy":
          for (const option of requiredOptions[sub[0]]) {
            if (!(option in options)) {
              console.log(
                Chalk.red(`Missing required option ${Chalk.yellow(option)}\n`)
              );
              printHelp(
                [["deploy", "Deploy a function on Blockless"]],
                [
                  ["--name", "The name of the function to deploy (required)"],
                  [
                    "--path",
                    "The location of the function' to deploy (required)",
                  ],

                  [
                    "--rebuild",
                    "Build the package before deploying it (optional; defaults to undefined)",
                  ],
                  [
                    "--debug",
                    "Specifying the 'debug' option will build the debug version, otherwise the release version will be built (optional; defaults to undefined; only applicable if using the '--rebuild' option)",
                  ],
                ]
              );
              return;
            }
          }
          runDeploy(options);
          break;
        case "invoke":
          runInvoke(options);
          break;
        default:
          break;
      }
      //todo: add verbose logging flag
      // console.log(name, sub);
    }
  )
  .command("console", "Open the Blockless console in browser", () => {
    didRun = true;
  })
  .command(
    "login",
    "Login to the the CLI",
    (name: string, sub: string[], options: any) => {
      runLogin(sub);
      didRun = true;
    }
  );

export async function cli(argv: any, packageJson: any) {
  pkg = packageJson;
  const flags = args.parse(process.argv, {
    name: name,
    version: false,
  } as any);
  if (!didRun) args.showHelp();
}
