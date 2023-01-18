import type { Argv } from "yargs"
import { run as runInit } from "./init"
import { run as runBuild } from "./build"
import { run as runPreview } from "./preview"

export function sitesCli(yargs: Argv) {
  yargs
    .usage('bls sites [subcommand]')
    .demandOption('experimental')

  yargs.command(
    'init [name]',
    'Initializes a blockless site project with a given name and template',
    (yargs) => {
      return yargs
        .positional('name', {
          description: 'Set the name of the local function project',
          type: 'string',
          default: undefined
        })
        .option('name', {
          alias: 'n',
          description: 'The target name for the blockless function'
        })
        .group(['name'], 'Options:')
    },
    (argv) => {
      runInit(argv)
    }
  )

  yargs.command(
    'build [path]',
    'Builds and creates a wasm archive of a static site',
    (yargs) => {
      return yargs
        .positional('path', {
          description: 'Set the path to the local function project',
          type: 'string',
          default: undefined
        })
        .option('debug', {
          alias: 'd',
          description: 'Add a debug flag to the function build',
          type: 'boolean',
          default: false
        })
        .group(['debug'], 'Options:')
    },
    (argv) => {
      runBuild(argv as any)
    }
  )

  yargs.command(
    'preview [path]',
    'Previews the static site within the Blockless WASM runtime',
    (yargs) => {
      return yargs
        .positional('path', {
          description: 'Set the path to the local function project',
          type: 'string',
          default: undefined
        })
    },
    (argv) => {
      runPreview(argv)
    }
  )
}