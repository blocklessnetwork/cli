import args from "args";
import Chalk from "chalk";
import { store, set as storeSet } from "./store";
import open from "open";

import * as wallet from "./commands/wallet";
import { run as runInstall } from "./commands/offchain/install";
import { run as runStart } from "./commands/offchain/start";
import {
  runDeploy,
  runInit,
  runInvoke,
  runList,
  runPublish,
} from "./commands/function";
import { run as runLogin } from "./commands/login";
import { run as runInfo } from "./commands/info";

let didRun = false;
let pkg = { version: "0.0.0" };
const name = "bls";
const consoleHost = "https://console.bls.dev";

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
    {
      name: "yes",
      description:
        "Assume yes to all prompts. This will skip all prompts and use default values",
    },
  ])
  .command(
    "offchain",
    "Interact with local off-chain network [install, start, configure]",
    async (name: string, sub: string[], options: any) => {
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
          runInstall(options);
          break;
        case "start":
          runStart(options);
          break;
      }
    }
  )
  .command("info", "Information about the local Blockless environment", () => {
    didRun = true;
    runInfo({ pkg });
  })
  .command(
    "wallet",
    "Interact with the Blockless blockchain [list, remove]",
    async (name: string, sub: string[], options) => {
      if (sub[0]) {
        didRun = true;
        const method = (wallet as any)[`${sub[0]}Wallet`];
        if (method) await method(options);
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
        publish: string[];
      }
      const requiredOptions: RequiredOptions = {
        init: ["name"],
        deploy: ["name", "path"],
        publish: ["name", "path"],
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
                [["deploy", "Deploy a function on Blockless."]],
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
        case "publish":
          for (const option of requiredOptions[sub[0]]) {
            if (!(option in options)) {
              console.log(
                Chalk.red(`Missing required option ${Chalk.yellow(option)}\n`)
              );
              printHelp(
                [
                  [
                    "publish",
                    "Publish a function on Blockless and make it available to other functions",
                  ],
                ],
                [
                  ["--name", "The name of the function to publish (required)"],
                  [
                    "--path",
                    "The location of the function' to publish (required)",
                  ],

                  [
                    "--rebuild",
                    "Build the package before publishing it (optional; defaults to undefined)",
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
          runPublish(options);
          break;
        case "invoke":
          runInvoke(options);
          break;
        case "list":
          runList(options);
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

    // opens the url in the default browser
    open(consoleHost);
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
