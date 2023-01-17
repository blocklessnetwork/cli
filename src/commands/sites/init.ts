import fs from 'fs'
import { resolve } from 'path'
import Chalk from "chalk"
import { logger } from "../../lib/logger"
import { getNpmConfigInitVersion, getNpmInstallationStatus, handleNpmInstallation, parseNpmConfigVersion } from '../../lib/npm'
import { downloadRepository } from '../../lib/git'
import { slugify } from '../../lib/strings'
import promptSitesInit from '../../prompts/sites/init'
import { generateBaseConfig, saveBlsConfig } from '../../lib/blsConfig'

export const run = async (options: any) => {
  let {
    name,
    path = process.cwd(),
    private: isPrivate = true
  } = options

  try {
    // Check and warn if project has been initialized, if yes, bail.
    const baseConfigExists = fs.existsSync(!!name ? resolve(path, name, 'bls.toml') : resolve(path, 'bls.toml'))
    if (baseConfigExists) {
      console.log(Chalk.red(`A bls.toml configuration file already exists! Please remove it before running this command again.`))
      return
    }

    // Check whether NPM is installed
    if (!getNpmInstallationStatus()) {
      await handleNpmInstallation()
      return
    }

    // Load up site name and details
    const packageJsonPath = !!name ? resolve(path, name, 'package.json') : resolve(path, 'package.json')
    const packageJsonExists = fs.existsSync(packageJsonPath)
    const packageJson = require(packageJsonPath)

    const prompts = await promptSitesInit({ name: (packageJson.name || options.name), siteExists: packageJsonExists })
    if (!prompts) return

    const { name: siteName, template } = prompts
    if (!!siteName) name = siteName

    const sanitizedName = slugify(name)
    const installationPath = packageJsonExists ? resolve(process.cwd(), path) : resolve(process.cwd(), path, sanitizedName)
    const configPath = resolve(installationPath, 'bls.toml')
    const version = getNpmConfigInitVersion()

    // Check and warn if project has been initialized, if yes, bail.
    const configExists = fs.existsSync(configPath)
    if (configExists) {
      console.log(Chalk.red(`A bls.toml configuration file already exists! Please remove it before running this command again.`))
      return
    }

    // Validate installation environment
    let isValidated = !!siteName
    
    if (!isValidated) {
      return
    }

    console.log(`${Chalk.yellow("Initalizing:")} new site in ${Chalk.blue(installationPath)}`)

    // Clone Repository
    if (template) {
      try {
        await downloadRepository({ repoUrl: template, destination: installationPath })
      } catch (error: any) {
        logger.error('Failed to clone starter template.', error.message)
        return
      }
    }

    try {
      // Create bls.toml configuration file
      saveBlsConfig(generateBaseConfig({
        framework: 'site',
        name: sanitizedName,
        version: parseNpmConfigVersion(version),
        isPrivate
      }), installationPath)
    } catch (error: any) {
      logger.error('Failed to create project level configuration.', error.message)
      return
    }

    // Success Message
    console.log(`${Chalk.green("Success:")} blockless site initalized at ${Chalk.blue(installationPath)}`)
    console.log("")
    console.log(`Change into the directory ${installationPath} to get started`)

  } catch (error: any) {
    logger.error('Failed to initialize site, please try again.', error.message)
    return
  }
}