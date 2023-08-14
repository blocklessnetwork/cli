import Chalk from 'chalk'

import { parseBlsConfig } from '../../../lib/blsConfig'
import { logger } from '../../../lib/logger'
import { gatewayRequest } from '../../../lib/gateway'
import { normalizeFunctionName } from '../../../lib/strings'

interface EnvUnsetCommandOptions {
	target: string | undefined
	envVars: {
		[key: string]: null
	}
}

/**
 * Entry function for bls function env unset
 *
 * @param options
 * @returns
 */
export const run = async (options: EnvUnsetCommandOptions) => {
	try {
		if (options.target) {
			await unsetEnvVars({ name: options.target, envVars: options.envVars })
		} else {
			const { name: configName } = parseBlsConfig()
			await unsetEnvVars({ name: configName, envVars: options.envVars })
		}
	} catch (error: any) {
		logger.error('Failed to unset environment variables.', error.message)
		return
	}
}

const unsetEnvVars = async ({
	name: functionName,
	envVars
}: {
	name: string
	envVars: {
		[key: string]: null
	}
}) => {
	logger.log(Chalk.yellow(`Unsetting environment variables for ${functionName} ...`))

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

		await gatewayRequest('[PATCH] /functions/{id}/env-vars', {
			id: internalFunctionId,
			envVars
		})

		logger.log(Chalk.green(`Successfully updated function ${functionName}!`))
	} catch (error) {
		logger.error('Failed to unset environment variables.')
	}
}
