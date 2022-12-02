import prompts from "prompts"

interface PromptRuntimeConfirmOutput {
  confirm: boolean
}

const prompRuntimeConfirm = async (): Promise<PromptRuntimeConfirmOutput> => {
  console.log(`\nLocal environment needed for execution is not installed.`)

  const inputResponse = await prompts(
    [
      {
        type: 'confirm',
        name: 'confirm',
        message: `Do you wish to install now?`,
        initial: true
      }
    ]
  )

  return inputResponse
}

export default prompRuntimeConfirm