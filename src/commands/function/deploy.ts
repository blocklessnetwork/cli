import Chalk from "chalk"
import { run as runPublish } from "./publish"
import { basename, resolve } from "path"
import { consoleClient } from "../../lib/http"

/**
 * Helper to deploy a bls function via CLI
 * 
 * 0. Publish package and retrive
 * 1. Get list of user functions
 * 2. Decide whether to update or create a new function (based on function name), bail if deploying same data
 * 3. Call new or update API with function config parameters
 * 4. Run deploy
 * 
 * @param data 
 * @returns 
 */
const deployFunction = async (data: any) => {
  const { cid: functionId, name: functionName } = data
  console.log(Chalk.yellow(`Deploying ${functionName}`))

  let matchingFunction = null
  let internalFunctionId = null

  // Find all matching functions
  try {
    const { data } = await consoleClient.post(`/api/modules/mine`, {})
    const matchingFunctions = data.filter((f: any) => f.functionName === functionName)

    if (matchingFunctions && matchingFunctions.length > 0) {
      matchingFunction = matchingFunctions[matchingFunctions.length - 1]
      internalFunctionId = matchingFunction._id
    }
  } catch (error) {
    console.log('Failed to retrive user functions', error)
    return
  }

  // Create or Update the user function
  try {
    const fnAction = !internalFunctionId ? `new` : `update`
    const fnBody = !internalFunctionId ?
      { functionId, name: functionName } :
      { _id: internalFunctionId, functionId, name: functionName, status: 'deploying' }

    const { data } = await consoleClient.post(`/api/modules/${fnAction}`, fnBody)
    if (!internalFunctionId && data && data._id) internalFunctionId = data._id
  } catch (error) {
    console.log('Failed to update function metadata', error)
    return
  }

  // Deploy Function
  try {
    if (!internalFunctionId) throw new Error('Unable to retrive function ID')

    await consoleClient.post(`/api/modules/deploy`, {
      userFunctionid: internalFunctionId,
      functionId: functionId,
      functionName: functionName.replace(/\s+/g, "-"),
    })

    console.log(
      Chalk.green(
        `Successfully deployed ${functionName} with id ${functionId}`
      )
    )
  } catch (error) {
    console.log('Failed to publish function', error)
    return
  }

  return
}

export const run = (options: any) => {
  const {
    debug,
    name = basename(resolve(process.cwd())),
    path = process.cwd(),
    rebuild,
  } = options

  const {
    bls: { manifest },
  } = require(`${path}/package`)

  runPublish({
    debug,
    name,
    path,
    publishCallback: deployFunction,
    rebuild,
    manifest,
  })
}
