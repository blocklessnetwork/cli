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
    ASSEMBLY_SCRIPT = 'assemblyscript',
    GOLANG = 'golang'
}

const templates = {
    [EBlsFramework.ASSEMBLY_SCRIPT]: [
        { title: 'None', value: 'https://github.com/blocklessnetwork/template-assemblyscript-default' },
        { title: 'Hello World', value: 'https://github.com/blocklessnetwork/template-assemblyscript-hello-world' }
    ],
    [EBlsFramework.RUST]: [
        { title: 'None', value: 'https://github.com/blocklessnetwork/template-rust-default' },
        { title: 'Hello World', value: 'https://github.com/blocklessnetwork/template-rust-hello-world' }
    ],
    [EBlsFramework.GOLANG]: [
        { title: 'None', value: 'https://github.com/blocklessnetwork/template-golang-default' },
        { title: 'Hello World', value: 'https://github.com/blocklessnetwork/template-golang-hello-world' }
    ]
}

const promptFnInit = async (options: PromptDeployOptions): Promise<PromptDeployOutput> => {
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
                    { title: 'Rust', value: EBlsFramework.RUST },
                    { title: 'Golang', value: EBlsFramework.GOLANG }
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
                initial: 1
            }
        ]
    )

    return {
        ...inputResponse,
        ...templateResponse
    }
}

export default promptFnInit