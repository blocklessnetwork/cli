import type { Argv } from "yargs"
import { run as runInit } from "./init"
import { run as runList } from "./list"
import { run as runBuild } from "./build"
import { run as runPreview } from "./preview"
import { run as runDelete } from "./delete"
import { run as runDeploy } from "./deploy"

export function sitesCli(yargs: Argv) {
  yargs
    .usage('bls sites [subcommand]')
    .demandOption('experimental')

  yargs.command(
    'list',
    'Lists your deployed blockless sites',
    () => { },
    () => {
      runList()
    }
  )

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
    'delete [target]',
    'Undeploys and deletes a site from the network',
    (yargs) => {
      return yargs
        .positional('target', {
          description: 'The name of the site to delete (Defaults to the working directory)',
          type: 'string',
          default: undefined
        })
    },
    (argv) => {
      runDelete(argv as any)
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
        .option('rebuild', {
          description: 'Rebuild the funciton',
          type: 'boolean',
          default: true
        })
        .group(['rebuild'], 'Options:')
    },
    (argv) => {
      runPreview(argv)
    }
  )

  yargs.command(
    'deploy [path]',
    'Deploys a static site on Blockless',
    (yargs) => {
      return yargs
        .positional('path', {
          description: 'Set the path to the static site project',
          type: 'string',
          default: undefined
        })
    },
    (argv) => {
      runDeploy(argv as any)
    }
  )
}