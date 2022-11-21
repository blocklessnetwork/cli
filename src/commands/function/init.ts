import fs from 'fs'
import Chalk from "chalk"
import { resolve } from "path"
import { execSync } from "child_process"
import { getNpmConfigInitVersion, getNpmInstallationStatus, handleNpmInstallation, parseNpmConfigVersion } from "../../lib/npm"
import { slugify } from "../../lib/strings"
import { randomName } from "../../lib/randomName"
import { generateBaseConfig, parseTomlConfig, saveBlsConfig, saveTomlConfig } from "../../lib/blsConfig"
import promptFnInit from '../../prompts/function/init'
import { downloadRepository } from '../../lib/git'
import { JsonMap } from './interfaces'
import { getCargoInstallationStatus, handleCargoInstallation } from '../../lib/cargo'

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
    const prompts = await promptFnInit({ name })
    if (!prompts) return

    const { name: functionName, framework, template } = prompts

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
    let isValidated = !!functionName && !!framework && !!template
    
    switch (framework) {
      case 'assemblyscript':
        // Check whether NPM is installed
        if (!getNpmInstallationStatus()) {
          await handleNpmInstallation()
          return
        }
        
        break;

      case 'rust':
        // Check whether Cargo/Rust is installed
        if (!getCargoInstallationStatus()) isValidated = await handleCargoInstallation()
        break
    }

    if (!isValidated) {
      return
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
      saveBlsConfig(generateBaseConfig({
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

        case 'rust':
          try {
            const cargoConfig = parseTomlConfig(installationPath, 'Cargo.toml')
            if (cargoConfig.package) (cargoConfig.package as JsonMap).name = sanitizedName
            saveTomlConfig(cargoConfig, installationPath, 'Cargo.toml')
            execSync(`cd ${installationPath}; cargo update`, { stdio: 'ignore' })
          } catch (error) {
            console.log(`${Chalk.red('Error:')} failed to configure Rust function`)
          }
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