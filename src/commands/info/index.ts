import Chalk from "chalk";
import { store } from "../../store";
export const run = (options: any) => {
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
  console.log(`  ${Chalk.yellow("CLI Version:")} ${options.pkg.version}`);
  console.log(`  ${Chalk.yellow("Platform:")} ${store.system.platform}`);
  console.log(`  ${Chalk.yellow("Architecture:")} ${store.system.arch}`);
  console.log(
    `  ${Chalk.yellow("Base directory:")} ${store.system.homedir}/.bls`
  );
  console.log(
    `  ${Chalk.yellow("Runtime Library:")} ${store.system.homedir}/.bls/runtime`
  );
  console.log(
    `  ${Chalk.yellow("Networking Library:")} ${
      store.system.homedir
    }/.bls/network`
  );
};
