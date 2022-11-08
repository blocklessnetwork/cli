import prompts from "prompts"

interface PromptDeployOptions {
    name: string
}

interface PromptDeployOutput {
    name: string
    framework: string
    template: string
}

enum EBlsFramework {
    RUST = 'rust',
    ASSEMBLY_SCRIPT = 'assemblyscript'
}

const templates = {
    [EBlsFramework.ASSEMBLY_SCRIPT]: [
        { title: 'Hello World', value: 'https://github.com/blocklessnetwork/template-assemblyscript-hello-world' }
    ],
    [EBlsFramework.RUST]: [
        { title: 'Hello World', value: 'https://github.com/blocklessnetwork/template-rust-hello-world' }
    ]
}

const promptFnInit = async (options: PromptDeployOptions): Promise<PromptDeployOutput | null> => {
    try {
        const inputResponse = await prompts(
            [
                {
                    type: 'text',
                    name: 'name',
                    message: `What would you like to name your function?`,
                    initial: options.name as string
                },
                {
                    type: 'select',
                    name: 'framework',
                    message: 'Pick a framework',
                    choices: [
                        { title: 'Assembly Script', value: EBlsFramework.ASSEMBLY_SCRIPT },
                        { title: 'Rust', value: EBlsFramework.RUST }
                    ],
                    initial: 0
                }
            ]
        )

        const templateResponse = await prompts(
            [
                {
                    type: 'select',
                    name: 'template',
                    message: 'Pick a starter template',
                    choices: templates[inputResponse.framework as EBlsFramework],
                    initial: 0
                }
            ]
        )

        return {
            ...inputResponse,
            ...templateResponse
        }
    } catch (error) {
        return null
    }
}

export default promptFnInit