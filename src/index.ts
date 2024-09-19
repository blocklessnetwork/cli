import yargs from 'yargs'
import type Yargs from "yargs"

import { listWallet } from './commands/wallet/list'
import { removeWallet } from './commands/wallet/remove'
import { functionCli } from './commands/function'
import { offchainCli } from './commands/offchain'
import { run as runLogin } from './commands/login'
import { run as runSelfUpdate } from './commands/self-update'

import { openInBrowser } from './lib/browser'
import { getGatewayUrl } from './lib/urls'
import { logger } from './lib/logger'
import { sitesCli } from './commands/sites'
import * as compareVersions from "compare-versions";
import { getNodeVersion } from './lib/npm'
const MIN_NODE_VERSION = "18.10";


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
    .showHelpOnFail(false)
    .fail((msg, error) => {
      if (!error || error.name === "YError") {
        error = new Error(msg)
      }

      throw error
    })
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
        cli.parse([...args._.map((a) => `${a}`), "--help"], parseCliResponse)
      )
    },
  }

  cli.command(
    'login',
    'Logs into your blockless account',
    (yargs) => {
      return yargs
        .option('auth-url', {
          alias: 'u',
          description: 'Include an authentication host with your login command',
          default: 'dashboard.blockless.network'
        })
        .option('auth-port', {
          alias: 'p',
          description: 'Include an authentication port with your login command',
          default: 443
        })
        .option('auth-token', {
          alias: 't',
          description: 'Include an authentication token with your login command',
        })
        .group(['auth-url', 'auth-port', 'auth-token'], 'Options:')
    },
    (argv) => {
      runLogin(argv)
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
      await openInBrowser(getGatewayUrl())
    }
  )

  cli.command(
    'components',
    'Manages the components of the local environment',
    (yargs) => offchainCli(yargs.command(subCommands))
  )

  cli.command(
    ['function', 'functions'],
    'Manages your functions',
    (yargs) => functionCli(yargs.command(subCommands))
  )

  cli.command(
    'sites',
    'Manages your sites',
    (yargs) => sitesCli(yargs.command(subCommands))
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
  blsCli.version(options.version)
  blsCli.epilogue(`Blockless CLI v${options.version}`)

  if (compareVersions.compare(getNodeVersion(), MIN_NODE_VERSION, "<")) {
    console.error(
      `Bls CLI requires at least node.js v${MIN_NODE_VERSION}.\nYou are using v${process.versions.node}. Please update your version of node.js. Consider using Node.js version manager https://github.com/nvm-sh/nvm.`,
    );
    process.exit(1);
  }

  if (argv.length > 0) {
    try {
      blsCli.parse(argv, parseCliResponse)
    } catch (error: any) {
      logger.error(error.message)
    }
  } else {
    blsCli.parse('--help', parseCliResponse)
  }
}

/**
 * Helper function to parse yargs CLI output
 * 
 */
const parseCliResponse = (err: Error, argv: any, output: string) => {
  if (output) {
    let formattedOutput = output
    formattedOutput = formattedOutput.replace(/\[boolean\]/g, '')
    
    if (!!argv.help && !!argv._ && argv._.length > 0 && !output.startsWith('bls [command] [subcommand]')) {
      formattedOutput = formattedOutput.replace(/\s\sbls\s\w+\s/g, '  ')
    }

    logger.log(formattedOutput)
  }
}