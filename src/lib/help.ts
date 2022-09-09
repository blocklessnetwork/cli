import Chalk from "chalk";
import { NAME } from "../store/constants";
import { store } from "../store";

export function printHelp(commands: any = [], options: any = [], { pkg }: any) {
  console.log("");
  console.log(
    `  Usage: ${Chalk.yellow(NAME)} ${Chalk.green("[command]")} ${Chalk.blue(
      "[subcommand]"
    )} [--options]`
  );
  console.log("");
  console.log("  Commands:");
  console.log("");
  for (const command of commands) {
    console.log(`       ${Chalk.green(command[0])}     ${command[1]}`);
  }

  console.log("");
  if (options.length > 0) console.log("  Options:");
  console.log("");
  for (const option of options) {
    console.log(`       ${Chalk.yellow(option[0])}     ${option[1]}`);
  }

  console.log("");
  console.log(
    `  ${Chalk.yellow("Blockless CLI")} ${store.system.platform}/${
      store.system.arch
    }-${pkg.version}`
  );
}
