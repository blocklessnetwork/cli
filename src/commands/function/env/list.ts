import Chalk from 'chalk'
import Table from 'cli-table3'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

import { parseBlsConfig } from '../../../lib/blsConfig'
import { gatewayRequest } from '../../../lib/gateway'
import { logger } from '../../../lib/logger'
import { normalizeFunctionName } from '../../../lib/strings'

dayjs.extend(relativeTime)

interface EnvSetCommandOptions {
	target: string | undefined
}

/**
 * Entry function for bls function env list
 *
 * @param options
 * @returns
 */
export const run = async (options: EnvSetCommandOptions) => {
	try {
		if (options.target) {
			await listEnvVars({ name: options.target })
		} else {
			const { name: configName } = parseBlsConfig()
			await listEnvVars({ name: configName })
		}
	} catch (error: any) {
		logger.error('Failed to list environment variables.', error.message)
		return
	}
}

const listEnvVars = async ({ name: functionName }: { name: string }) => {
	logger.log(Chalk.yellow(`Listing environment variables for ${functionName} ...`))
	logger.log('')

	try {
		let matchingFunction = null
		let internalFunctionId = null

		const { data } = await gatewayRequest('[GET] /functions')
		const functions = data.docs ? data.docs : []

		// Sort all matching functions by name and select the last matching function
		// TODO: Ensure all functions have unique names under a user's scope
		const matchingFunctions = functions.filter(
			(f: any) => normalizeFunctionName(f.functionName) === normalizeFunctionName(functionName)
		)

		if (matchingFunctions && matchingFunctions.length > 0) {
			matchingFunction = matchingFunctions[matchingFunctions.length - 1]
			internalFunctionId = matchingFunction._id
		}

		// If a function does not exist, request the user to deploy that function first
		if (!matchingFunction) {
			throw new Error('Function not found.')
		}

		const { data: fn } = await gatewayRequest('[GET] /functions/{id}', { id: internalFunctionId })

		var table = new Table({
			wordWrap: true,
			wrapOnWordBoundary: false,
			head: ['Name', 'Last Updated'],
			colWidths: [25]
		})

		fn.envVars.map((envVar: any) =>
			table.push([envVar.name, envVar.updatedAt ? dayjs().to(envVar.updatedAt) : 'Unknown'])
		)

		logger.log(table.toString())
	} catch (error) {
		logger.error('Failed to list environment variables.')
	}
}
