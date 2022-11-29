import yargs from 'yargs'
import type Yargs from "yargs"

import { listWallet } from './commands/wallet/list'
import { removeWallet } from './commands/wallet/remove'
import { functionCli } from './commands/function'
import { offchainCli } from './commands/offchain'
import { run as runLogin } from './commands/login'
import { run as runSelfUpdate } from './commands/self-update'

import { openInBrowser } from './lib/browser'
import { getConsoleServer } from './lib/urls'

/**
 * Yargs options included in every wrangler command.
 */
export interface CommonYargsOptions {
  v: boolean | undefined
  config: string | undefined
  env: string | undefined
}

function createCLI(argv: string[]) {
  const cli: Yargs.Argv<any> = yargs(argv)
    .strict()
    .scriptName('bls')
    .version(false)
    .usage('bls [command] [subcommand]')
    .wrap(null)
    .option("v", {
      describe: "Show version number",
      alias: "version",
      type: "boolean",
    })
    .option("yes", {
      alias: "y",
      describe: "Assume yes to all prompts",
      type: "boolean"
    })

  cli.group(["yes", "help", "version"], "Flags:")
  cli.help().alias("h", "help")

  const subCommands: Yargs.CommandModule<CommonYargsOptions, CommonYargsOptions> = {
    command: ["*"],
    handler: async (args) => {
      setImmediate(() =>
        cli.parse([...args._.map((a) => `${a}`), "--help"])
      )
    },
  }

  cli.command(
    'login',
    'Logs into your blockless account',
    (yargs) => {
      return yargs
        .option('auth-token', {
          alias: 't',
          description: 'Include an authentication token with your login command',
        })
        .group(['auth-token'], 'Options:')
    },
    (argv) => {
      runLogin(argv.options)
    }
  )

  cli.command(
    'logout',
    'Logs out of your blockless account',
    () => {},
    async (argv) => {
      removeWallet()
    }
  )

  cli.command(
    'whoami',
    'Shows the currently logged in user',
    () => { },
    async () => {
      listWallet()
    }
  )

  cli.command(
    'console',
    'Opens the Console in the browser',
    () => { },
    async () => {
      await openInBrowser(getConsoleServer())
    }
  )

  cli.command(
    'components',
    'Manages the components of the local environment',
    (yargs) => offchainCli(yargs.command(subCommands))
  )

  cli.command(
    'function',
    'Manages your functions',
    (yargs) => functionCli(yargs.command(subCommands))
  )

  cli.command(
    'self-update',
    'Update the Blockless CLI',
    (yargs) => {
      return yargs
        .option('tag', {
          alias: 't',
          description: 'Release tag of the Blockless CLI',
          default: 'latest'
        })
    },
    (argv) => {
      const version = argv.tag || 'latest'
      runSelfUpdate({ version })
    }
  )

  cli.command(
    'help',
    'Shows the usage information'
  )

  return cli
}

/**
 * Main function
 * 
 * @param argv 
 */
export async function main(argv: string[], options: any) {
  const blsCli = createCLI(argv)

  // console.log(`blockless cli ${options.version}`)
  // console.log('')

  if (argv.length > 0) {
    try {
      blsCli.version(options.version)
      blsCli.epilogue(`Blockless CLI v${options.version}`)
      await blsCli.parse()
    } catch (error: any) {
      console.info(`${error.message}\n ${await blsCli.getHelp()}`)
    }
  } else {
    console.log(await blsCli.getHelp())
  }
}