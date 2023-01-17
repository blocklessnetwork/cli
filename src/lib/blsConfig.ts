import fs from 'fs'
import { stringify, parse } from '@iarna/toml'
import { IBlsConfig, JsonMap } from '../commands/function/interfaces'

/**
 * Generate a base BLS function config
 * 
 */
interface BaseConfigParams {
    framework: string
    name: string
    version: string
    isPrivate: boolean
}
export const generateBaseConfig = ({ 
    framework, name, version, isPrivate 
}: BaseConfigParams): JsonMap => {
    const defaultConfig = {
        name,
        version,

        deployment: {
            permission: isPrivate ? 'private' : 'public',
            nodes: 4
        }
    } as JsonMap

    if (framework === 'site') {
        defaultConfig.type = 'site'
        defaultConfig.content_type = 'html'
        
        defaultConfig.build = {
            dir: '.bls',
            public_dir: 'out',
            entry: `${name}_debug.wasm`,
            command: 'npm run build && npm run export'
        }

        defaultConfig.build_release = {
            dir: '.bls',
            public_dir: 'out',
            entry: `${name}.wasm`,
            command: 'npm run build && npm run export'
        }
    } else if (framework === 'assemblyscript') {
        defaultConfig.build = {
            dir: 'build',
            entry: `${name}_debug.wasm`,
            command: 'npm run build:debug'
        }

        defaultConfig.build_release = {
            dir: 'build',
            entry: `${name}.wasm`,
            command: 'npm run build:release'
        }
    } else if (framework === 'rust') {
        defaultConfig.build = {
            dir: 'target/wasm32-wasi/debug',
            entry: `${name}.wasm`,
            command: 'cargo build --target wasm32-wasi'
        }

        defaultConfig.build_release = {
            dir: 'target/wasm32-wasi/release',
            entry: `${name}.wasm`,
            command: 'cargo build --target wasm32-wasi --release'
        }
    }

    return defaultConfig
}

/**
 * Helper function to parse a BLS config file
 * 
 * @param filePath 
 * @param fileName 
 * @returns 
 */
export const parseBlsConfig = (filePath = './', fileName = 'bls.toml'): IBlsConfig => {
    return parseTomlConfig(filePath, fileName) as IBlsConfig
}

/**
 * Helper function to save BLS config
 * 
 * @param filePath 
 * @param fileName 
 * @returns 
 */
export const saveBlsConfig = (json: JsonMap, filePath = './', fileName = 'bls.toml') => {
    try {
        saveTomlConfig(json, filePath, fileName)
    } catch (error: any) {
        throw new Error(`Unable to save bls.toml, ${error.message}.`)
    }
}

/**
 * Helper function to parse a TOML config file
 * 
 * @param filePath 
 * @param fileName 
 * @returns 
 */
export const parseTomlConfig = (filePath: string, fileName: string): JsonMap => {
    try {
        const configPath = filePath + '/' + fileName
        return parse(fs.readFileSync(configPath, 'utf-8')) as JsonMap
    } catch (error: any) {
        throw new Error('Project or bls.toml not detected, run `bls init` to create a project.')
    }
}

/**
 * Helper function to stringify and same a TOML file
 * 
 * @param json 
 * @param filePath 
 * @param fileName 
 * @returns 
 */
export const saveTomlConfig = (json: JsonMap, filePath: string, fileName: string) => {
    const configData = stringify(json)
    const configPath = filePath + '/' + fileName

    return fs.writeFileSync(configPath, configData, { flag: "w" })
}