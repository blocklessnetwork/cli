import Chalk from "chalk"
import { run as runPublish } from "./publish"
import { basename, resolve } from "path"
import { consoleClient } from "../../lib/http"
import promptFnDeploy from "../../prompts/function/deploy"
import { parseBlsConfig } from "../../lib/blsConfig"
import { logger } from "../../lib/logger"
import { normalizeFunctionName, slugify } from "../../lib/strings"

interface DeployCommandOptions {
  name?: string
  path?: string
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
      name = configName || basename(resolve(process.cwd())),
      path = process.cwd()
    } = options

    runPublish({
      debug: false,
      name,
      path,
      publishCallback: (data: any) => deployFunction(slugify(name), data, options),
      rebuild: true,
    })
  } catch (error: any) {
    logger.error('Failed to deploy site.', error.message)
  }
}

/**
 * Helper to deploy a bls site via CLI
 * 
 * 1. Publish package and retrive ipfs site id
 * 2. Get list of user sites
 * 3. Decide whether to update or create a new site (based on site name), bail if deploying same data
 * 4. Call new or update API with site config parameters
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
    const { data } = await consoleClient.get(`/api/sites?limit=999`, {})
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
    logger.error('Failed to retrive deployed sites.', error.message)
    return
  }

  // Create or update site
  try {
    let response

    if (!internalFunctionId) {
      response = await consoleClient.post(`/api/sites`, { functionId, functionName })
    } else {
      response = await consoleClient.patch(
        `/api/sites/${internalFunctionId}`,
        { functionId, functionName, status: 'deploying' }
      )
    }

    if (!internalFunctionId && response.data && response.data._id) internalFunctionId = response.data._id
  } catch (error: any) {
    logger.error('Failed to update site metadata.', error.message)
    return
  }

  // Deploy Site
  try {
    if (!internalFunctionId) throw new Error('Unable to retrive site ID')
    console.log(Chalk.yellow(`Deploying ${functionName} ...`))

    const { data } = await consoleClient.put(`/api/sites/${internalFunctionId}/deploy`, {
      functionId: functionId
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
    logger.error('Failed to deploy site.', error.message)
    return
  }

  return
}