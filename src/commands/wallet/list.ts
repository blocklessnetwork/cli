import { getTokenFromStore } from "../../lib/utils";
import Chalk from "chalk";
// todo verify the jwt is valid
export const listWallet = (options: any) => {
  const token = getTokenFromStore();
  if (token) {
    console.log(`Wallet is currently ${Chalk.green("connected")}`);
  } else {
    console.log(
      `Wallet is currently ${Chalk.yellow(
        "disconnected"
      )}\nPlease login using the ${Chalk.red("bls login")} command`
    );
  }
};
