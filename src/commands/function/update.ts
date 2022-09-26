import Chalk from "chalk"
import { run as runPublish } from "./publish"
import { basename, resolve } from "path"
import { consoleClient } from "../../lib/http"
import { parseBlsConfig } from "../../lib/blsConfig"

interface UpdateCommandOptions {
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
export const run = (options: UpdateCommandOptions) => {
  const {
    name: configName
  } = parseBlsConfig()

  const {
    debug = true,
    name = configName || basename(resolve(process.cwd())),
    path = process.cwd(),
    rebuild,
  } = options

  runPublish({
    debug,
    name,
    path,
    publishCallback: updateFunction,
    rebuild
  })
}

/**
 * Helper to deploy a bls function via CLI
 * 
 * 1. Publish package and retrive ipfs function id
 * 2. Get list of user functions
 * 3. Decide whether to update or bail if deploying a new function
 * 4. Call the update API with function config parameters
 * 5. Run deploy
 * 
 * @param data 
 * @returns 
 */
const updateFunction = async (data: any) => {
  const { cid: functionId, name: functionName } = data
  console.log(Chalk.yellow(`Updating ${functionName} ...`))

  let matchingFunction = null
  let internalFunctionId = null

  // Find all matching functions, warn users if they are updating a function that is not deployed
  try {
    const { data } = await consoleClient.post(`/api/modules/mine`, {})

    // Sort all matching functions by name and select the last matching function
    // TODO: Ensure all functions have unique names under a user's scope
    const matchingFunctions = data.filter((f: any) => f.functionName === functionName)
    if (matchingFunctions && matchingFunctions.length > 0) {
      matchingFunction = matchingFunctions[matchingFunctions.length - 1]
      internalFunctionId = matchingFunction._id
    }

    // If a function does not exist, request the user to deploy that function first
    if (!matchingFunction) {
      console.log(Chalk.red(`Function ${functionName} has not yet been deployed.`))
      console.log(`Please run ${Chalk.yellow('bls function deploy')} to deploy your function.`)
      return
    }
  } catch (error) {
    console.log(Chalk.red('Failed to retrive user functions'))
    console.error(error)
    return
  }

  // Create or Update a user function
  try {
    if (!internalFunctionId) throw new Error('Unable to retrive function ID')

    const { data } = await consoleClient.post(`/api/modules/update`, {
      _id: internalFunctionId,
      functionId,
      name: functionName, status: 'deploying'
    })

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