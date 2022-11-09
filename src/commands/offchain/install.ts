import Chalk from "chalk";
import { getRuntime, getNetworking } from "../../lib/binaries";
import { generateKey } from "../../lib/keygen";
import {
  headConfigJSON,
  saveConfig,
  workerConfigJSON,
} from "../../lib/configs";
import { store, get as storeGet, set as storeSet } from "../../store";
import prompt from "prompt";

prompt.start();

const install = function () {
  const opts = storeGet("opts");
  storeSet("ops", {
    ...opts,
    installPath: `${store.system.homedir}/.bls`,
  });
  console.log("");
  console.log("");
  console.log(
    `${Chalk.yellow("Installing")} ... installing to ${store.ops.installPath}`
  );
  console.log(
    `${Chalk.yellow("Installing")} ... installing for ${
      store.system.platform
    }_${store.system.arch}`
  );

  console.log(
    `${Chalk.yellow("Installing")} ... downloading runtime environment`
  );
  getRuntime(() => {
    console.log(`${Chalk.green("Installing")} ... done`);
    console.log(
      `${Chalk.yellow("Installing")} ... downloading networking agent`
    );
    getNetworking(() => {
      console.log(`${Chalk.green("Installing")} ... done`);
      console.log(
        `${Chalk.yellow("Installing")} ... downloading keygen identity tool`
      );
      
      console.log(`${Chalk.green("Installing")} ... done`);
      generateKey();

      (headConfigJSON as any).node.key_path = `${store.system.homedir}/.bls/network/keys/priv.bin`
      saveConfig(headConfigJSON, "head-config");
      saveConfig(workerConfigJSON, "worker-config");

      console.log(
        `${Chalk.green("Generating")} ... done`
      );

      console.log('')
      console.log(`Use the following commands to start blockless daemon:`);
      console.log('')
      console.log(`\t ${Chalk.blue("bls components start head")} to start the head agent`);
      console.log(`\t ${Chalk.blue("bls components start worker")} to start the worker agent`);
      console.log('')

      process.exit(0);
    });
  });
};
export const run = (options: any) => {
  const { yes = false } = options;
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
  prompt.message = "";
  prompt.delimiter = ":";
  if (!yes) {
    prompt.get(
      {
        properties: {
          path: {
            description: Chalk.magenta(
              `Install Location: (${store.system.homedir}/.bls)`
            ),
            required: false,
          },
        },
      },
      function (err: any, result: any) {
        if (err) {
          console.log(err);
        }
        install();
      }
    );
  } else {
    install();
  }

  return;
};
