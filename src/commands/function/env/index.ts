import { Argv } from 'yargs'
import { run as runList } from './list'
import { run as runSet } from './set'
import { run as runUnset } from './unset'
import { logger } from '../../../lib/logger'

export function functionEnvCli(yargs: Argv) {
	yargs.usage('bls function env [subcommand]')

	yargs.command(
		['list'],
		'Lists all environment variables for a function',
		(yargs) => {
			return yargs
				.option('target', {
					alias: 't',
					description: 'The name of the function (Defaults to the working directory)',
					type: 'string',
					default: undefined
				})
				.group(['target'], 'Options:')
		},
		(argv) => {
			runList({ target: argv.target })
		}
	)

	yargs.command(
		'set',
		'Set environment variables for a function',
		(yargs) => {
			return yargs
				.usage('set NAME=VALUE ...')
				.strict(false)
				.parserConfiguration({ 'unknown-options-as-args': true })
				.option('target', {
					alias: 't',
					description: 'The name of the function (Defaults to the working directory)',
					type: 'string',
					default: undefined
				})
				.group(['target'], 'Options:')
		},
		(argv) => {
			const vars = argv._.filter(
				(f: string | number) =>
					typeof f === 'string' &&
					['function', 'functions', 'env', 'set'].indexOf(f) === -1 &&
					/^[A-Za-z]{2,}=.+$/.test(f)
			) as string[]

			if (vars.length > 0) {
				const envVars = vars.reduce(
					(dest, item) => ({ ...dest, [item.split('=')[0]]: item.split('=')[1] }),
					{}
				)

				runSet({ target: argv.target, envVars })
			} else {
				logger.log('Skipping: Nothing to update.')
			}
		}
	)

	yargs.command(
		'unset',
		'Unset environment variables for a function',
		(yargs) => {
			return yargs
				.usage('unset NAME NAME2 ...')
				.strict(false)
				.parserConfiguration({ 'unknown-options-as-args': true })
				.positional('target', {
					alias: 't',
					description: 'The name of the function (Defaults to the working directory)',
					type: 'string',
					default: undefined
				})
				.group(['target'], 'Options:')
		},
		(argv) => {
			const envVarKeys = argv._.filter(
				(f: string | number) =>
					typeof f === 'string' &&
					['function', 'functions', 'env', 'unset'].indexOf(f) === -1 &&
					/^[A-Za-z]+$/.test(f)
			) as string[]

			if (envVarKeys.length > 0) {
				const envVars = envVarKeys.reduce((dest, key) => ({ ...dest, [key]: null }), {})
				runUnset({ target: argv.target, envVars })
			} else {
				logger.log('Skipping: Nothing to update.')
			}
		}
	)

	return yargs
}
