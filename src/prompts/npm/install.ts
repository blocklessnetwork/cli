import Chalk from "chalk"
import prompts from "prompts"

interface PromptNpmInstallOptions {
  minVersion: string
}

interface PromptNpmInstallOutput {
  confirm: boolean
}

const promptNpmInstall = async (options: PromptNpmInstallOptions): Promise<PromptNpmInstallOutput> => {
  console.log('')
  console.log(Chalk.red(`[error]`),
    `npm version ${options.minVersion} or higher is required to run this command.`,
    `\nnpm is a development dependency of the function you are trying to create.\n`)

  const inputResponse = await prompts(
    [
      {
        type: 'confirm',
        name: 'confirm',
        message: `Install the latest versions of nodejs and npm?`,
        initial: true
      }
    ]
  )

  return inputResponse
}

export default promptNpmInstall