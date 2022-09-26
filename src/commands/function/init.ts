import fs from 'fs'
import Chalk from "chalk"
import { resolve } from "path"
import { execSync } from "child_process"
import { getNpmConfigInitVersion, getNpmInstallationStatus, handleNpmInstallation, parseNpmConfigVersion } from "../../lib/npm"
import { slugify } from "../../lib/strings"
import { randomName } from "../../lib/randomName"
import { generateBaseConfig, saveTomlConfig } from "../../lib/blsConfig"
import promptFnInit from '../../prompts/function/init'
import { downloadRepository } from '../../lib/git'

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

  try {
    const { name: functionName, framework, template } = await promptFnInit({ name })

    if (!!functionName) name = functionName
    const sanitizedName = slugify(name)
    const installationPath = resolve(process.cwd(), `${path}`, sanitizedName)
    const configPath = resolve(installationPath, 'bls.toml')

    const version = getNpmConfigInitVersion()
    const functionId = `blockless-function_${sanitizedName}-${version}` // TODO: standardize function  IDs

    // Check and warn if project has been initialized, if yes, bail.
    const configExists = fs.existsSync(configPath)
    if (configExists) {
      console.log(Chalk.red(`A bls.toml configuration file already exists! Please remove it before running this command again.`))
      return
    }

    // Validate installation environment
    switch (framework) {
      case 'assemblyscript':
        // Check whether NPM is installed
        if (!getNpmInstallationStatus()) await handleNpmInstallation()
        break;

        // TODO: validate installation environment for Rust and Go
    }

    console.log(`${Chalk.yellow("Creating:")} new function in ${Chalk.blue(installationPath)}`)

    // Clone Repository
    try {
      await downloadRepository({ repoUrl: template, destination: installationPath })
    } catch (error) {
      console.log('Failed to clone starter template.')
      return
    }

    try {
      // Create bls.toml configuration file
      saveTomlConfig(generateBaseConfig({
        framework,
        name: sanitizedName,
        version: parseNpmConfigVersion(version),
        isPrivate
      }), installationPath)
    } catch (error) {
      console.log('Failed to create project level configuration.')
      return
    }

    try {
      // Finalize installation
      switch (framework) {
        case 'assemblyscript':
          execSync(`cd ${installationPath}; npm pkg set name=${sanitizedName}`)
          execSync(`cd ${installationPath}; npm pkg set bls.functionId=${functionId}`)
          execSync(`cd ${installationPath}; npm install`, { stdio: 'ignore' })
          break

        // TODO: finalize installation for Rust and Go
      }
    } catch (error) {
      console.log('Failed to finalize function setup, please try again.')
      return
    }

    // Success Message
    console.log(`${Chalk.green("Success:")} function created at ${Chalk.blue(installationPath)}`)
    console.log("")
    console.log(`Change into the directory ${installationPath} to get started`)

  } catch (error) {
    console.log(Chalk.red(`Failed to initialize function, please try again.`))
    return
  }

  return
}