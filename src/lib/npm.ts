import Chalk from "chalk"
import prompt from "prompt"
import { execSync } from "child_process"

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
    execSync("npm --version", { stdio: "ignore" })
    return true
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
  return new Promise<boolean>((resolve, reject) => {
    console.log(
      Chalk.red(`[error]`),
      `npm is required to run this command, please install it and try again\n`,
      `npm is a development dependency of the function you are trying to create\n`,
      "install npm: https://github.com/nvm-sh/nvm#install--update-script"
    )

    console.log(" ")
    prompt.get(
      {
        properties: {
          install: {
            description: Chalk.yellow(`install nodejs and npm? (Y/n)`),
            required: false,
            default: "y",
          },
        },
      },
      function (err: any, result: any) {
        if (err) {
          console.log(err)
          reject(err)
        } else if (result.install === "Y" || result.install === "y") {
          execSync(
            `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash`,
            { stdio: "ignore" }
          )
          execSync(
            `export NVM_DIR="$HOME/.nvm"
          [ -s "$NVM_DIR/nvm.sh" ] && \. $NVM_DIR/nvm.sh && nvm install 18`
          )
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
          console.log(
            "developmenmt tools installed, please restart this terminal session, or run the following command before trying again"
          )
          console.log("")
          console.log(
            `export NVM_DIR="$HOME/.nvm"\n[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" `
          )

          resolve(true)
        } else {
          resolve(false)
        }
      }
    )
  })
}