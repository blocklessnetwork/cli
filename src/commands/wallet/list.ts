import Chalk from "chalk"
import Table from "cli-table3"
import { parseJwt } from "../../lib/crypto"
import { getToken } from "../../store/db"

// todo verify the jwt is valid
export const listWallet = () => {
  const token = getToken()

  let publicAddress
  let walletType

  if (token) {
    try {
      const jwt = parseJwt(token)
      publicAddress = jwt.publicAddress
      walletType = jwt.walletType
    } catch {}
  }

  if (!!publicAddress && !!walletType) {
    console.log(`You are connected with a JWT token to the Blockless console!`)

    var table = new Table({
      head: ["Wallet", "Address"],
      wordWrap: true,
      wrapOnWordBoundary: false
    })
    
    table.push([walletType, publicAddress])
    console.log(table.toString())
  } else {
    console.log(
      `Wallet is currently ${Chalk.yellow(
        "disconnected"
      )}\nPlease login using the ${Chalk.yellow("bls login")} command`
    );
  }
};
