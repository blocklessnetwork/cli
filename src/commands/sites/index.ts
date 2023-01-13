import type { Argv } from "yargs"
import { run as runBuild } from "./build"
import { run as runPreview } from "./preview"

export function sitesCli(yargs: Argv) {
  yargs
    .usage('bls sites [subcommand]')

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
      console.log('preview', argv)
      // runPreview()
    }
  )
}