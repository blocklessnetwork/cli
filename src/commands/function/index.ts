import type { Argv } from "yargs"
import { run as runList } from "./list"
import { run as runInit } from "./init"
import { run as runBuild } from "./build"
import { run as runInvoke } from "./invoke"
import { run as runDeploy } from "./deploy"
import { run as runUpdate } from "./update"

export function functionCli(yargs: Argv) {
  yargs
    .usage('bls function [subcommand]')

  yargs.command(
    'list',
    'Lists your deployed blockless functions',
    () => { },
    () => {
      runList()
    }
  )

  yargs.command(
    'init [framework] [name]',
    'Initializes a function project with a given name and template',
    (yargs) => {
      return yargs
        .positional('name', {
          description: 'Set the name of the local function project',
          type: 'string',
          default: undefined
        })
        .positional('framework', {
          description: 'Set the framework for the local function project',
          type: 'string',
          choices: ['assemblyscript', 'rust'],
          default: undefined
        })
        .option('name', {
          alias: 'n',
          description: 'The target name for the blockless function'
        })
        .option('template', {
          alias: 't',
          description: 'Blockless starter template to initialize the function'
        })
        .group(['name', 'template'], 'Options:')
    },
    (argv) => {
      runInit(argv)
    }
  )

  yargs.command(
    'build [path]',
    'Build',
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
          default: true
        })
        .group(['debug'], 'Options:')
    },
    (argv) => {
      runBuild(argv as any)
    }
  )

  yargs.command(
    'deploy [path]',
    'Deploy',
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
          default: true
        })
        .option('rebuild', {
          description: 'Rebuild the funciton',
          default: true
        })
        .group(['debug', 'rebuild'], 'Options:')
    },
    (argv) => {
      runDeploy(argv as any)
    }
  )

  yargs.command(
    'update [path]',
    'Initialize a new function with blockless starter template.',
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
          default: true
        })
        .option('rebuild', {
          description: 'Rebuild the funciton',
          default: true
        })
        .group(['debug', 'rebuild'], 'Options:')
    },
    (argv) => {
      runUpdate(argv)
    }
  )

  yargs.command(
    'invoke [path]',
    'Initialize a new function with blockless starter template.',
    (yargs) => {
      return yargs
        .positional('path', {
          description: 'Set the path to the local function project',
          type: 'string',
          default: undefined
        })
        .option('stdin', {
          alias: 's',
          description: 'Add stdin arguments to the local function. Eg. --stdin arg1 arg2',
          type: 'array'
        })
        .option('debug', {
          alias: 'd',
          description: 'Add a debug flag to the function build',
          default: true
        })
        .option('rebuild', {
          description: 'Rebuild the funciton',
          default: true
        })
        .option("env", {
          alias: "e",
          describe: "Includes environment variables. Eg. --env MY_ENV_VAR=value",
          type: "string"
        })
        .group(['debug', 'rebuild'], 'Options:')
    },
    (argv) => {
      runInvoke(argv)
    }
  )

  yargs.command(
    'help',
    'Shows the usage information'
  )

  return yargs
}