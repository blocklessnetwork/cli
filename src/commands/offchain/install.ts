import Chalk from "chalk";
import fs from "fs";
import { getRuntime, getKeygen, getNetworking } from "../../lib/binaries";
import { generateKey } from "../../methods/keygen";
import {
  coordinatorConfigJSON,
  saveConfig,
  workerConfigJSON,
} from "../../lib/configs";
import { store, get as storeGet, set as storeSet } from "../../store";
import { activateRuntime } from "../../methods/runtime";

export const run = () => {
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
                 #%%%%%%%#                            
`)
  );
  console.log("installing local networking agent...");
  console.log("");
  // term.magenta(`Install Location: (${store.system.homedir}/.bls)`);
  // term.inputField(function (error: any, input: any) {
  //   const opts = storeGet("opts");
  //   storeSet("ops", {
  //     ...opts,
  //     installPath: `${store.system.homedir}/.bls`,
  //   });
  //   console.log("");
  //   console.log("");
  //   console.log(
  //     `${Chalk.yellow("Installing")} ... installing to ${store.ops.installPath}`
  //   );
  //   console.log(
  //     `${Chalk.yellow("Installing")} ... installing for ${
  //       store.system.platform
  //     }_${store.system.arch}`
  //   );

  //   console.log(
  //     `${Chalk.yellow("Installing")} ... downloading runtime environment`
  //   );
  //   getRuntime(() => {
  //     console.log(`${Chalk.green("Installing")} ... done`);
  //     console.log(
  //       `${Chalk.yellow("Installing")} ... downloading networking agent`
  //     );
  //     getNetworking(() => {
  //       console.log(`${Chalk.green("Installing")} ... done`);
  //       console.log(
  //         `${Chalk.yellow("Installing")} ... downloading keygen identity tool`
  //       );
  //       getKeygen(() => {
  //         console.log(`${Chalk.green("Installing")} ... done`);
  //         generateKey();
  //         const identity = fs.readFileSync(
  //           `${store.system.homedir}/.bls/network/keys/identity`,
  //           { encoding: "utf8", flag: "r" }
  //         );
  //         (workerConfigJSON as any).node.coordinator_id = identity;
  //         saveConfig(workerConfigJSON, "worker");
  //         saveConfig(coordinatorConfigJSON, "coordinator");
  //         console.log("");

  //         activateRuntime();
  //         console.log(
  //           `use the command ${Chalk.blue(
  //             "bls offchain start"
  //           )} to start the agent`
  //         );

  //         process.exit(0);
  //       });
  //     });
  //   });
  //   return;
  // });
  return;
};
