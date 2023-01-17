import fs from "fs"
import prompts from "prompts"
import { randomName } from "../../lib/randomName"

interface PromptDeployOptions {
    name: string,
    siteExists: boolean
}

interface PromptDeployOutput {
    name: string
    template: string
}

const templates = [
  { title: 'Hello World', value: 'https://github.com/blocklessnetwork/template-site-hello-world' },
  { title: 'Next.js', value: 'https://github.com/blocklessnetwork/template-site-nextjs' }
]

const promptSitesInit = async (options: PromptDeployOptions): Promise<PromptDeployOutput | null> => {
    try {
        const nameResponse = !options.name ? await prompts(
            [
                {
                    type: 'text',
                    name: 'name',
                    message: `What would you like to name your site?`,
                    initial: randomName()
                }
            ],
            {
                onCancel: () => {
                    console.log("Cancelled by user, exiting...")
                    process.exit(1)
                }
            }
        ) : { name: options.name }
        
        const templateResponse = !options.siteExists ? await prompts(
            [
                {
                    type: 'select',
                    name: 'template',
                    message: 'Pick a starter template',
                    choices: templates,
                    initial: 0
                }
            ],
            {
                onCancel: () => {
                    console.log("Cancelled by user, exiting...")
                    process.exit(1)
                }
            }
        ) : { template: null }

        return {
            ...nameResponse,
            ...templateResponse
        }
    } catch (error) {
        return null
    }
}

export default promptSitesInit