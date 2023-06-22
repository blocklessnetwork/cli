import fs from 'fs'
import { resolve } from 'path'
import Chalk from "chalk"
import { logger } from "../../lib/logger"
import { getNpmConfigInitVersion, getNpmInstallationStatus, handleNpmInstallation, parseNpmConfigVersion } from '../../lib/npm'
import { slugify } from '../../lib/strings'
import promptSitesInit from '../../prompts/sites/init'
import { generateBaseConfig, saveBlsConfig } from '../../lib/blsConfig'
import { generateFramework } from './fameworks'
import { JsonMap } from '@iarna/toml'

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
    const prompts = await promptSitesInit({
      name: options.name,
      siteExists: false
    })
    if (!prompts) return

    const { name: siteName, framework } = prompts
    if (!!siteName) name = siteName

    const sanitizedName = slugify(name)
    const installationPath = resolve(process.cwd(), path, sanitizedName)
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

    try {
      const config = await generateFramework({
        id: framework,
        name: sanitizedName,
        path,
        installationPath
      })

      const baseConfig = generateBaseConfig({
        framework: 'site',
        name: sanitizedName,
        version: parseNpmConfigVersion(version),
        isPrivate
      });

      (baseConfig.build as JsonMap).command = config.build;
      (baseConfig.build as JsonMap).public_dir = config.publicDir;
      (baseConfig.build_release as JsonMap).command = config.build;
      (baseConfig.build_release as JsonMap).public_dir = config.publicDir;

      saveBlsConfig(baseConfig, installationPath)
    } catch (error: any) {
      logger.error('Failed to initalize framework.', error.message)
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