import Chalk from "chalk"
import { run as runPublish } from "./publish"
import { basename, resolve } from "path"
import { consoleClient } from "../../lib/http"
import { gatewayRequest } from "../../lib/gateway"
import promptFnDeploy from "../../prompts/function/deploy"
import { parseBlsConfig } from "../../lib/blsConfig"
import { logger } from "../../lib/logger"
import { normalizeFunctionName, slugify } from "../../lib/strings"

interface DeployCommandOptions {
  name?: string,
  path?: string
  rebuild?: boolean
  debug?: boolean
  yes?: boolean
}

/**
 * Entry function for bls function deploy
 * 
 * @param options 
 */
export const run = (options: DeployCommandOptions) => {
  try {
    const {
      name: configName
    } = parseBlsConfig()

    const {
      debug = true,
      name = configName || basename(resolve(process.cwd())),
      path = process.cwd(),
      rebuild = true,
      yes = false
    } = options

    runPublish({
      debug,
      name,
      path,
      publishCallback: (data: any) => deployFunction(slugify(name), data, options),
      rebuild,
    })
  } catch (error: any) {
    logger.error('Failed to deploy function.', error.message)
  }
}

/**
 * Helper to deploy a bls function via CLI
 * 
 * 1. Publish package and retrive ipfs function id
 * 2. Get list of user functions
 * 3. Decide whether to update or create a new function (based on function name), bail if deploying same data
 * 4. Call new or update API with function config parameters
 * 5. Run deploy
 * 
 * @param data 
 * @returns 
 */
const deployFunction = async (functionName: string, functionData: any, options: DeployCommandOptions) => {
  const { cid: functionId } = functionData
  let matchingFunction = null
  let internalFunctionId = null

  // Find all matching functions, warn users if they are overwriting a deployed function
  try {
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

    // If a function exists and has been deployed, request a user's confirmation
    if (matchingFunction && matchingFunction.status === 'deployed' && !options.yes) {
      const { confirm } = await promptFnDeploy({ name: matchingFunction.functionName })

      if (!confirm) {
        throw new Error("Cancelled by user, aborting deployment.")
      }
    }
  } catch (error: any) {
    logger.error('Failed to retrive deployed functions.', error.message)
    return
  }

  // Create or Update a user function
  try {
    const fnAction = !internalFunctionId ? `new` : `update`
    const fnBody = !internalFunctionId ?
      { functionId, name: functionName } :
      { _id: internalFunctionId, functionId, name: functionName, status: 'deploying' }

    const { data } = await consoleClient.post(`/api/modules/${fnAction}`, fnBody)
    if (!internalFunctionId && data && data._id) internalFunctionId = data._id
  } catch (error: any) {
    logger.error('Failed to update function metadata.', error.message)
    return
  }

  // Deploy Function
  try {
    if (!internalFunctionId) throw new Error('Unable to retrive function ID')
    console.log(Chalk.yellow(`Deploying ${functionName} ...`))

    const { data } = await consoleClient.post(`/api/modules/deploy`, {
      userFunctionid: internalFunctionId,
      functionId: functionId,
      functionName: functionName.replace(/\s+/g, "-"),
    })

    if (!!data.err) {
      console.log(Chalk.red(`Deployment unsuccessful, ${data.message}`))
    } else {
      console.log(Chalk.green(`Deployment successful!`));

      const domain =
        !!data.domainMappings &&
        data.domainMappings.length > 0 &&
        data.domainMappings[0].domain;

      console.log(`${Chalk.blue("Name:")}   ${data.functionName}`)
      if (domain) console.log(`${Chalk.blue("URL:")}    https://${domain}`)
      console.log(`${Chalk.blue("CID:")}    ${data.functionId}`)
    }
  } catch (error: any) {
    logger.error('Failed to deploy function.', error.message)
    return
  }

  return
}