import Chalk from "chalk"
import Table from "cli-table3"
import { parseJwt } from "../../lib/crypto"
import { getToken } from "../../store/db"

export const listWallet = () => {
  const token = getToken()

  let publicAddress
  let walletType
  let expiredTime = 0

  if (token) {
    try {
      const jwt = parseJwt(token)
      publicAddress = jwt.publicAddress
      walletType = jwt.walletType
      expiredTime = new Date(jwt.exp * 1000).getTime()
    } catch {}
  }

  if (!!publicAddress && !!walletType && expiredTime > Date.now()) {
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
      `Wallet is currently ${Chalk.red(
        "disconnected"
      )}\nPlease login using the ${Chalk.yellow("bls login")} command`
    );
  }
};
