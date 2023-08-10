import { Argv } from 'yargs'

export function functionEnvCli(yargs: Argv) {
	yargs.usage('bls function env [subcommand]')

	yargs.command(
		'list <target>',
		'Lists all environment variables for a function',
		(yargs) => {
			return yargs.positional('target', {
				description: 'The name of the function (Defaults to the working directory)',
				type: 'string',
				default: undefined
			})
		},
		(argv) => {
			console.log('list env vars', argv.target)
		}
	)

	yargs.command(
		'set <target>',
		'Set environment variables for a function',
		(yargs) => {
			return yargs
				.usage('set <target> NAME=VALUE ...')
				.strict(false)
				.parserConfiguration({ 'unknown-options-as-args': true })
				.positional('target', {
					description: 'The name of the function (Defaults to the working directory)',
					type: 'string',
					default: undefined
				})
		},
		(argv) => {
			const vars = argv._.filter(
				(f: string | number) =>
					typeof f === 'string' &&
					['function', 'env', 'set'].indexOf(f) === -1 &&
					/^[A-Za-z]{2,}=.+$/.test(f)
			)

			console.log('set env vars', argv.target, vars)
		}
	)

	yargs.command(
		'unset <target>',
		'Unset environment variables for a function',
		(yargs) => {
			return yargs
				.usage('unset <target> NAME NAME2 ...')
				.strict(false)
				.parserConfiguration({ 'unknown-options-as-args': true })
				.positional('target', {
					description: 'The name of the function (Defaults to the working directory)',
					type: 'string',
					default: undefined
				})
		},
		(argv) => {
			const keys = argv._.filter(
				(f: string | number) =>
					typeof f === 'string' &&
					['function', 'env', 'unset'].indexOf(f) === -1 &&
					/^[A-Za-z]+$/.test(f)
			)

			console.log('unset env vars', argv.target, keys)
		}
	)
}
