import Chalk from "chalk"
import { parseBlsConfig } from "../../lib/blsConfig"
import { consoleClient } from "../../lib/http"
import { gatewayRequest } from "../../lib/gateway"
import { logger } from "../../lib/logger"
import { normalizeFunctionName } from "../../lib/strings"

interface StopCommandOptions {
  target: string
}

/**
 * Entry function for bls function deploy
 * 
 * @param options 
 */
export const run = async (options: StopCommandOptions) => {
  try {
    if (options.target) {
      await stopFunction({ name: options.target })
    } else {
      const { name: configName } = parseBlsConfig()
      await stopFunction({ name: configName })
    }
  } catch (error: any) {
    logger.error('Failed to delete function.', error.message)
  }
}

/**
 * 
 * @param data 
 * @returns 
 */
const stopFunction = async (data: any) => {
  const { name: functionName } = data

  let matchingFunction = null
  let internalFunctionId = null

  // Find all matching functions, warn users if they are updating a function that is not deployed
  try {
    console.log(Chalk.yellow(`Stopping ${functionName} ...`))
    console.log('')

    const { data } = await gatewayRequest("[GET] /functions")
    const functions = data.docs ? data.docs : []

    // Sort all matching functions by name and select the last matching function
    // TODO: Ensure all functions have unique names under a user's scope
    const matchingFunctions = functions.filter((f: any) => 
      normalizeFunctionName(f.functionName) === normalizeFunctionName(functionName))
      
    if (matchingFunctions && matchingFunctions.length > 0) {
      matchingFunction = matchingFunctions[matchingFunctions.length - 1]
      internalFunctionId = matchingFunction._id
    }

    // If a function does not exist, request the user to deploy that function first
    if (!matchingFunction) {
      throw new Error('Function not found.')
    }
  } catch (error: any) {
    logger.error('Failed to retrive deployed functions.', error.message)
    return
  }

  // Stop the function
  try {
    if (!internalFunctionId || !matchingFunction) 
      throw new Error('Unable to retrive function ID.')

    const { data } = await gatewayRequest('[PATCH] /functions/{id}', {
      id: internalFunctionId,
      name: matchingFunction.functionName,
      status: 'stopped'
    })
    
    if (!data) throw new Error("")

    console.log(
      Chalk.green(
        `Successfully stopped function ${functionName}!`
      )
    )
  } catch (error: any) {
    logger.error('Failed to stop function.', error.message)
    return
  }
}