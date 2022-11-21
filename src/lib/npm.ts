import Chalk from "chalk"
import { execSync } from "child_process"
import { compareVersions } from 'compare-versions'
import promptNpmInstall from "../prompts/npm/install"

const MIN_NPM_VERSION = '7.24.2'

// Node version
export const getNpmVersion = (): string =>
  execSync("npm --version").toString("utf-8").trim()

// Node/npm config
export const getNpmConfigInitVersion = (): string =>
  execSync("npm config get init-version").toString("utf-8")

/**
 * Check whether NPM is installed
 * 
 * @returns boolean 
 */
export const getNpmInstallationStatus = (): boolean => {
  try {
    const npmVersion = getNpmVersion()
    return compareVersions(npmVersion, MIN_NPM_VERSION) >= 0
  } catch (e) {
    return false
  }
}

/**
 * Parse NPM config version to string
 */
export const parseNpmConfigVersion =
  (input: string) =>
    input.replace('version', '').trim()

/**
 * Handle NPM installation
 * 
 */
export const handleNpmInstallation = () => {
  return new Promise<boolean>(async (resolve, reject) => {
    const { confirm } = await promptNpmInstall({ minVersion: MIN_NPM_VERSION })

    if (confirm) {
      execSync(
        `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash`,
        { stdio: "ignore" }
      )
      
      try {
        execSync(`export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. $NVM_DIR/nvm.sh && nvm install v18`)
      } catch (error) {}

      try {
        execSync(
          `export NVM_DIR="$HOME/.nvm"
          [ -s "$NVM_DIR/nvm.sh" ] && \. $NVM_DIR/nvm.sh && npm --version`,
          { stdio: "ignore" }
        )
      } catch (e) {
        console.log(
          Chalk.red(
            `[error] unable to install npm/node please try manually`
          )
        )
      }
      
      console.log('')
      console.log(
        Chalk.green('Success:'),
        "Dependencies installed, please restart this terminal session, or run the following command before trying again:\n",
        `\nexport NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion" && nvm use v18`
      )

      resolve(true)
    } else {
      resolve(false)
    }
  })
}