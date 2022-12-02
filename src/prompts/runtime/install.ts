import prompts from "prompts"
import os from "os"
import path from "path"

interface PromptRuntimeInstallOutput {
  path: string
}

const prompRuntimeInstall = async (): Promise<PromptRuntimeInstallOutput> => {
  console.log(`\nInstalling local networking agent ...`)

  const placeholder = path.resolve(os.homedir(), '.bls')
  const inputResponse = await prompts(
    [
      {
        type: 'text',
        name: 'path',
        message: `Install Location:`,
        initial: placeholder
      }
    ]
  )

  return inputResponse
}

export default prompRuntimeInstall