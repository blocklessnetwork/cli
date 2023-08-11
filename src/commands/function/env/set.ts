import Chalk from 'chalk'

import { parseBlsConfig } from '../../../lib/blsConfig'
import { gatewayRequest } from '../../../lib/gateway'
import { logger } from '../../../lib/logger'
import { normalizeFunctionName } from '../../../lib/strings'

interface EnvSetCommandOptions {
	target: string | undefined
	envVars: {
		[key: string]: string
	}
}

/**
 *
 * @param options
 * @returns
 */
export const run = async (options: EnvSetCommandOptions) => {
	try {
		if (options.target) {
			await setEnvVars({ name: options.target, envVars: options.envVars })
		} else {
			const { name: configName } = parseBlsConfig()
			await setEnvVars({ name: configName, envVars: options.envVars })
		}
	} catch (error: any) {
		logger.error('Failed to set environment variables.', error.message)
		return
	}
}

const setEnvVars = async ({
	name: functionName,
	envVars
}: {
	name: string
	envVars: {
		[key: string]: string
	}
}) => {
	logger.log(Chalk.yellow(`Setting environment variables for ${functionName} ...`))

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
	} catch (error: any) {
		logger.error('Failed to set environment variables.', error.message)
		return
	}
}
