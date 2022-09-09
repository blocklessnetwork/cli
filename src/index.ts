import args from "args";
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
  runUpdate,
  runBuild,
} from "./commands/function";
import { run as runLogin } from "./commands/login";

import { printHelp } from "./lib/help";
import { IBlsFunctionRequiredOptions } from "./commands/function/interfaces";
import { getConsoleServer } from "./lib/urls";
import { NAME } from "./store/constants";

let didRun = false;
let pkg: any;

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
    "components",
    "Interact with local off-chain network [install, configure]",
    async (name: string, sub: string[], options: any) => {
      didRun = true;
      if (!sub[0] || sub[0] === "help") {
        printHelp([["install", "install the off-chain agent"]], null, { pkg });
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

  // interact with functions
  .command(
    "function",
    "Interact with Functions [init, invoke, delete, deploy, list]",
    (name: string, sub: string[], options) => {
      const requiredOptions: IBlsFunctionRequiredOptions = {
        init: ["name"],
        deploy: ["name"],
        publish: ["name"],
        update: ["name"],
      };

      const subs: any = {
        init: runInit,
        invoke: runInvoke,
        delete: runInvoke,
        deploy: runDeploy,
        list: runList,
        publish: runPublish,
        update: runUpdate,
        build: runBuild,
      };

      didRun = true;
      if (!sub[0] || sub[0] === "help") {
        printHelp(
          [
            [
              "init\t",
              "Initialize a new function with blockless starter template.",
            ],
            ["deploy\t", "Deploy a function on Blockless."],
            [
              "list\t",
              "Retrieve a list of funtions deployed at Blockless Console.",
            ],
            [
              "invoke\t",
              "Invokes the function at the current (cwd) directory.",
            ],
            ["update\t", "Update an existing function on Blockless."],
          ],
          null,
          { pkg }
        );
        return;
      }

      if (subs[sub[0]]) {
        subs[sub[0]](options);
      }
    }
  )

  // open url in default browser
  .command("console", "Open the Blockless console in browser", () => {
    didRun = true;
    open(getConsoleServer());
  })

  // check to see info about the user logged in
  .command(
    "whoami",
    "Check logged in user",
    async (name: string, sub: string[], options: any) => {
      didRun = true;
      const method = (wallet as any)[`listWallet`];
      if (method) await method(options);
    }
  )

  // login to blockless console
  .command(
    "login",
    "Login to the the CLI",
    (name: string, sub: string[], options: any) => {
      runLogin(sub);
      didRun = true;
    }
  )

  // destroy access token
  .command(
    "logout",
    "Logout of the CLI",
    async (name: string, sub: string[], options) => {
      didRun = true;
      const method = (wallet as any)[`removeWallet`];
      if (method) await method(options);
    }
  );

const help = () => {
  printHelp(
    [
      ["login\t", " Logs into your account"],
      ["logout\t", " Logs out of your account"],
      ["whoami\t", " Shows the currently logged in user"],
      ["console\t", " Opens the Developer Console in the browser"],
      ["components", "Install and manage local environment"],
      ["function", "  Manages your functions"],
      ["help\t", " Shows the usage information"],
    ],
    [["--yes\t", " Skip questions using default values"]],
    { pkg }
  );
};

export async function cli(argv: any, packageJson: any) {
  pkg = packageJson;
  const flags = args.parse(process.argv, {
    name: NAME,
    version: false,
    help: false,
  } as any);
  if (!didRun) help();
}
