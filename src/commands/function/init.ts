import fs from 'fs'
import Chalk from "chalk"
import prompts from 'prompts'
import { resolve } from "path"
import { execSync } from "child_process"
import { getNpmConfigInitVersion, getNpmInstallationStatus, handleNpmInstallation } from "../../lib/npm"
import { parseNpmConfigVersion, slugify } from "../../lib/utils"
import { randomName } from "../../lib/randomName"
import { generateBaseConfig, saveTomlConfig } from "../../lib/blsConfig"

/**
 * Execute the `init` command line operation
 * 
 * @param options 
 * @returns void
 */
export const run = async (options: any) => {
  let {
    name = randomName(),
    path = process.cwd(),
    private: isPrivate = true
  } = options

  // Check whether NPM is installed
  if (!getNpmInstallationStatus()) await handleNpmInstallation()

  try {
    const inputResponse = await prompts(
      [
        {
          type: 'text',
          name: 'name',
          message: `What would you like to name your function?`,
          initial: name as string
        },
        {
          type: 'select',
          name: 'language',
          message: 'Pick a language',
          choices: [
            { title: 'Assembly Script', value: 'as' },
            { title: 'Rust', value: 'rust' }
          ],
          initial: 0
        },
        {
          type: 'select',
          name: 'template',
          message: 'Pick a template',
          choices: [
            { title: 'Blank', value: 'blank' },
            { title: 'Hello World', value: 'hello-world' }
          ],
          initial: 1
        }
      ]
    )

    if (inputResponse.name) {
      name = inputResponse.name
    }
  } catch (error) {
    console.log(Chalk.red(`Invalid input, please try again.`))
    return
  }

  // Initialize new local project
  try {
    const sanitizedName = slugify(`${name}`)
    const installationPath = resolve(process.cwd(), `${path}`, sanitizedName)
    const version = getNpmConfigInitVersion()
    const configPath = resolve(installationPath, 'bls.toml')
    const functionId = `blockless-function_${sanitizedName}-${version}` // TODO: standardize function  IDs

    console.log(
      `${Chalk.blue("Initializing")} new function in \n${Chalk.yellow(
        installationPath
      )} \nwith ID ${functionId}`
    )

    // Check and warn if project has been initialized, if yes, bail.
    const configExists = fs.existsSync(configPath)
    if (configExists) {
      console.log(Chalk.red(`A bls.toml configuration file already exists! Please remove it before running this command again.`))
      return
    }

    // Create project folder
    execSync(`mkdir -p ${installationPath}; cd ${installationPath};`, { stdio: "ignore" })

    // Create bls.toml configuration file
    saveTomlConfig(generateBaseConfig({
      name: sanitizedName,
      version: parseNpmConfigVersion(version),
      isPrivate
    }), installationPath)

    // Run Blockless Create APP
    execSync(`
      cd ${installationPath};
      npm init @blockless/app; 
      npm pkg set name=${sanitizedName} private=${Boolean(isPrivate).toString()} "bls.functionId"=${functionId}`,
      { stdio: 'ignore' })

    // Success Message
    console.log(`Initialization of function\n${Chalk.blue(installationPath)}\ncompleted ${Chalk.green("successfully")}`)
    console.log("")
    console.log(`change into the directory\n${installationPath}\nto get started`)

    return
  } catch (error) {
    console.error(Chalk.red(`Failed to initialize function, please try again.`), error)
    return
  }
}