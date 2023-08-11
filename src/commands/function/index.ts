import type Yargs from 'yargs'
import type { Argv } from 'yargs'
import { run as runList } from './list'
import { run as runInit } from './init'
import { run as runBuild } from './build'
import { run as runInvoke } from './invoke'
import { run as runDeploy } from './deploy'
import { run as runUpdate } from './update'
import { run as runStop } from './stop'
import { run as runDelete } from './delete'
import { functionEnvCli } from './env'
import { logger } from '../../lib/logger'

export function functionCli(yargs: Argv) {
	const subCommands: Yargs.CommandModule = {
		command: ['*'],
		handler: async (args) => {
			setImmediate(() =>
				yargs.parse([...args._.map((a) => `${a}`), '--help'], parseFunctionsCliResponse)
			)
		}
	}

	yargs.usage('bls function [subcommand]')

	yargs.command(
		'list',
		'Lists your deployed blockless functions',
		() => {},
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
		'stop [target]',
		'Undeploys a function from the network',
		(yargs) => {
			return yargs.positional('target', {
				description: 'The name of the function to stop (Defaults to the working directory)',
				type: 'string',
				default: undefined
			})
		},
		(argv) => {
			runStop(argv as any)
		}
	)

	yargs.command(
		'delete [target]',
		'Undeploys and deletes a function from the network',
		(yargs) => {
			return yargs.positional('target', {
				description: 'The name of the function to delete (Defaults to the working directory)',
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
		'Builds and creates a wasm archive of a local function project',
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
		'deploy [path]',
		'Deploys a local function on Blockless',
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
				.option('rebuild', {
					description: 'Rebuild the funciton',
					type: 'boolean',
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
		'Updates an existing deployed function on Blockless',
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
				.option('rebuild', {
					description: 'Rebuild the funciton',
					type: 'boolean',
					default: true
				})
				.group(['debug', 'rebuild'], 'Options:')
		},
		(argv) => {
			runUpdate(argv)
		}
	)

	yargs.command('env', 'Manages your functions environment variables', (yargs) =>
		functionEnvCli(yargs.command(subCommands))
	)

	yargs.command(
		'invoke [path]',
		'Invokes the function at the current working directory',
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
					type: 'boolean',
					default: false
				})
				.option('rebuild', {
					description: 'Rebuild the funciton',
					type: 'boolean',
					default: false
				})
				.option('serve', {
					description: 'Server the invoke result through a web server',
					type: 'boolean',
					default: false
				})
				.option('env', {
					alias: 'e',
					describe: 'Includes environment variables. Eg. --env MY_ENV_VAR=value',
					type: 'string'
				})
				.group(['debug', 'rebuild'], 'Options:')
		},
		(argv) => {
			runInvoke(argv)
		}
	)

	yargs.command('help', 'Shows the usage information')

	return yargs
}

/**
 * Helper function to parse yargs CLI output
 *
 */
const parseFunctionsCliResponse = (err: Error, argv: any, output: string) => {
	if (output) {
		let formattedOutput = output
		formattedOutput = formattedOutput.replace(/\[boolean\]/g, '')

		if (
			!!argv.help &&
			!!argv._ &&
			argv._.length > 0 &&
			!output.startsWith('bls function [subcommand]')
		) {
			formattedOutput = formattedOutput.replace(/\s\sbls\s\w+\s/g, '  ')
		}

		logger.log(formattedOutput)
	}
}
