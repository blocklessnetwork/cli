import fs from "fs"
import prompts from "prompts"
import { randomName } from "../../lib/randomName"
import { listFrameworks } from "../../commands/sites/fameworks"

interface PromptDeployOptions {
    name: string,
    siteExists: boolean
}

interface PromptDeployOutput {
    name: string
    framework: string
}

const frameworks = listFrameworks().map(f => ({ title: f.name, value: f.id }))

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
                    name: 'framework',
                    message: 'Pick a framework',
                    choices: frameworks,
                    initial: 0
                }
            ],
            {
                onCancel: () => {
                    console.log("Cancelled by user, exiting...")
                    process.exit(1)
                }
            }
        ) : { framework: null }

        return {
            ...nameResponse,
            ...templateResponse
        }
    } catch (error) {
        return null
    }
}

export default promptSitesInit