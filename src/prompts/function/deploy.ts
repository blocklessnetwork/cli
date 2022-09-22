import Chalk from "chalk"
import prompts from "prompts"

interface PromptDeployOptions {
    name: string
}

interface PromptDeployOutput {
    confirm: boolean
}

const promptFnDeploy = async (options: PromptDeployOptions): Promise<PromptDeployOutput> => {
    console.log(`\nA function with the name ${Chalk.yellow(options.name)} already exists, this action will override the functon.`)

    const inputResponse = await prompts(
        [
            {
                type: 'confirm',
                name: 'confirm',
                message: `Do you wish to continue?`,
                initial: false
            }
        ]
    )

    return inputResponse
}

export default promptFnDeploy