import prompts from "prompts"
import { randomName } from "../../lib/randomName"

interface PromptDeployOptions {
    name: string
    framework: string
}

interface PromptDeployOutput {
    name: string
    framework: string
    template: string
}

enum EBlsFramework {
    RUST = 'rust',
    ASSEMBLY_SCRIPT = 'assemblyscript',
    JAVY_TYPESCRIPT = 'typescript'
}

const templates = {
    [EBlsFramework.ASSEMBLY_SCRIPT]: [
        { title: 'Hello World', value: 'https://github.com/blocklessnetwork/template-assemblyscript-hello-world' },
        { title: 'Price Oracle', value: 'https://github.com/blocklessnetwork/template-assemblyscript-price-oracle' }
    ],
    [EBlsFramework.RUST]: [
        { title: 'Hello World', value: 'https://github.com/blocklessnetwork/template-rust-hello-world' }
    ],
    [EBlsFramework.JAVY_TYPESCRIPT]: [
        { title: 'Hello World', value: 'https://github.com/blocklessnetwork/template-javy-typescript-hello-world' }
    ]

}

const promptFnInit = async (options: PromptDeployOptions): Promise<PromptDeployOutput | null> => {
    try {
        const nameResponse = !options.name ? await prompts(
            [
                {
                    type: 'text',
                    name: 'name',
                    message: `What would you like to name your function?`,
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
        
        const matchedFramework = !!options.framework && Object.values(EBlsFramework).includes(options.framework as EBlsFramework)
        const frameworkResponse = !matchedFramework ? await prompts(
            [
                    {
                    type: 'select',
                    name: 'framework',
                    message: 'Pick a framework',
                    choices: [
                        { title: 'Assembly Script', value: EBlsFramework.ASSEMBLY_SCRIPT },
                        { title: 'Rust', value: EBlsFramework.RUST },
                        { title: 'Typescript (Javy)', value: EBlsFramework.JAVY_TYPESCRIPT },
                    ],
                    initial: 0
                }
            ],
            {
                onCancel: () => {
                    console.log("Cancelled by user, exiting...")
                    process.exit(1)
                }
            }
        ) : { framework: options.framework }

        const templateResponse = await prompts(
            [
                {
                    type: 'select',
                    name: 'template',
                    message: 'Pick a starter template',
                    choices: templates[frameworkResponse.framework as EBlsFramework],
                    initial: 0
                }
            ],
            {
                onCancel: () => {
                    console.log("Cancelled by user, exiting...")
                    process.exit(1)
                }
            }
        )

        return {
            ...nameResponse,
            ...frameworkResponse,
            ...templateResponse
        }
    } catch (error) {
        return null
    }
}

export default promptFnInit