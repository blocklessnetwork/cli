import Chalk from "chalk"
import prompt from "prompt"
import { execSync } from "child_process"

/**
 * Check whether Cargo/Rust is installed
 * 
 * @returns boolean 
 */
export const getCargoInstallationStatus = (): boolean => {
  try {
    execSync("cargo --version", { stdio: "ignore" })
    return true
  } catch (e) {
    return false
  }
}

/**
 * Handle Cargo/Rust installation
 * 
 */
export const handleCargoInstallation = () => {
  return new Promise<boolean>((resolve, reject) => {
    console.log(
      Chalk.red(`[error]`),
      `cargo/rust is required to run this command, please install it and try again\n`,
      `cargo/rust is a development dependency of the function you are trying to create\n`,
      "install rust: https://doc.rust-lang.org/book/ch01-01-installation.html"
    )

    console.log(" ")
    prompt.get(
      {
        properties: {
          install: {
            description: Chalk.yellow(`install rust and cargo? (Y/n)`),
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
          try {
            execSync(
              `curl https://sh.rustup.rs -sSf | sh -s -- -y`,
              { stdio: "ignore" }
            )
            execSync(
              `export PATH="$HOME/.cargo/bin:$PATH"`
            )

            console.log(Chalk.green('Success:'), "developmenmt tools installed.")
            console.log("")
            resolve(true)
          } catch (e) {
            console.log(
              Chalk.red(`[error]`),
              `unable to install cargo/rust please try to install them manually.\n`,
              `install rust: https://doc.rust-lang.org/book/ch01-01-installation.html`
            )
            resolve(false)
          }
        } else {
          resolve(false)
        }
      }
    )
  })
}