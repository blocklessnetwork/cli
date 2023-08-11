import Chalk from "chalk"
import { parseBlsConfig } from "../../lib/blsConfig"
import { gatewayRequest } from "../../lib/gateway"
import { logger } from "../../lib/logger"
import { normalizeFunctionName } from "../../lib/strings"

interface DeleteCommandOptions {
  target: string
}

/**
 * Entry function for bls function deploy
 * 
 * @param options 
 */
export const run = async (options: DeleteCommandOptions) => {
  try {
    if (options.target) {
      await deleteFunction({ name: options.target })
    } else {
      const { name: configName } = parseBlsConfig()
      await deleteFunction({ name: configName })
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
const deleteFunction = async (data: any) => {
  const { name: functionName } = data

  let matchingFunction = null
  let internalFunctionId = null

  // Find all matching functions, warn users if they are updating a function that is not deployed
  try {
    console.log(Chalk.yellow(`Deleting ${functionName} ...`))
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

  // Delete the function
  try {
    if (!internalFunctionId || !matchingFunction)
      throw new Error('Unable to retrive function ID.')

    const { data } = await gatewayRequest('[DELETE] /functions/{id}', {
      id: internalFunctionId
    })

    if (!data) throw new Error("")

    console.log(
      Chalk.green(
        `Successfully deleted function ${functionName}!`
      )
    )
  } catch (error: any) {
    logger.error('Failed to delete function.', error.message)
    return
  }
}