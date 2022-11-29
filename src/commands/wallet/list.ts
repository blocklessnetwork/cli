import Chalk from "chalk";
import { getToken } from "../../store/db";

// todo verify the jwt is valid
export const listWallet = () => {
  const token = getToken();
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
