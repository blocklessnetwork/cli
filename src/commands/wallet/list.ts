import Chalk from "chalk"
import Table from "cli-table3"
import { parseJwt } from "../../lib/crypto"
import { getDb, getToken } from "../../store/db"
import { getGatewayUrl } from "../../lib/urls"

export const listWallet = () => {
  const token = getToken()
  const gatewayUrl = getGatewayUrl()
  const gatewayVersion = getDb().get("config.apiVersion").value()

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

  console.log('')

  if (!!publicAddress && !!walletType && expiredTime > Date.now()) {
    console.log(`You are connected with a JWT token to a Blockless Gateway!`)

    var table = new Table({
      wordWrap: true,
      wrapOnWordBoundary: false
    })
    
    table.push(
      [Chalk.magenta("Status"), Chalk.green("Connected")],
      [Chalk.magenta("Address"), publicAddress],
      [Chalk.magenta("Gateway"), gatewayUrl],
      [Chalk.magenta("Version"), (!gatewayVersion || gatewayVersion === 0) ? `v0.1 (Legacy)` : `v${gatewayVersion}`]
    );
    console.log(table.toString())
  } else {
    console.log(
      `Wallet is currently ${Chalk.red(
        "disconnected"
      )}\nPlease login using the ${Chalk.yellow("bls login")} command`
    );
  }
};
