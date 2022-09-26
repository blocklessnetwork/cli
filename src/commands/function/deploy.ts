import Chalk from "chalk"
import { run as runPublish } from "./publish"
import { basename, resolve } from "path"
import { consoleClient } from "../../lib/http"
import promptFnDeploy from "../../prompts/function/deploy"
import { parseBlsConfig } from "../../lib/blsConfig"

interface DeployCommandOptions {
  name?: string,
  path?: string
  rebuild?: boolean
  debug?: boolean
}

/**
 * Entry function for bls function deploy
 * 
 * @param options 
 */
export const run = (options: DeployCommandOptions) => {
  const {
    name: configName
  } = parseBlsConfig()

  const {
    debug = true,
    name = configName || basename(resolve(process.cwd())),
    path = process.cwd(),
    rebuild = true,
  } = options

  runPublish({
    debug,
    name,
    path,
    publishCallback: deployFunction,
    rebuild
  })
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
const deployFunction = async (data: any) => {
  const { cid: functionId, name: functionName } = data
  let matchingFunction = null
  let internalFunctionId = null

  // Find all matching functions, warn users if they are overwriting a deployed function
  try {
    const { data } = await consoleClient.post(`/api/modules/mine`, {})

    // Sort all matching functions by name and select the last matching function
    // TODO: Ensure all functions have unique names under a user's scope
    const matchingFunctions = data.filter((f: any) => f.functionName === functionName)
    if (matchingFunctions && matchingFunctions.length > 0) {
      matchingFunction = matchingFunctions[matchingFunctions.length - 1]
      internalFunctionId = matchingFunction._id
    }

    // If a function exists and has been deployed, request a user's confirmation
    if (matchingFunction && matchingFunction.status === 'deployed') {
      const { confirm } = await promptFnDeploy({ name: matchingFunction.functionName })

      if (!confirm) {
        console.log(Chalk.red('Aborting deployment.'))
        return
      }
    }
  } catch (error) {
    console.log(Chalk.red('Failed to retrive user functions'))
    console.error(error)
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
  } catch (error) {
    console.log('Failed to update function metadata')
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
      console.log(
        Chalk.green(
          `Successfully deployed ${functionName} with id ${functionId}`
        )
      )
    }
  } catch (error) {
    console.log('Failed to publish function')
    return
  }

  return
}