import type { Argv } from 'yargs'

import { run as runInstall } from './install'
import { run as runStart } from './start'

export function offchainCli(yargs: Argv) {
	yargs.usage('bls components [subcommand]')

	yargs.command(
		'install',
		'Install the off-chain agent',
		() => {},
		(argv) => {
			runInstall(argv)
		}
	)

	yargs.command(
		'start <agent>',
		'Start the off-chain agent',
		(yargs) => {
			return yargs.positional('agent', {
				choices: ['head', 'worker'],
				description: 'Type of the agent',
				required: false
			})
		},
		(argv) => {
			runStart(argv.agent)
		}
	)

	return yargs
}
