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

    if (framework === 'assemblyscript') {
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
    return saveTomlConfig(json, filePath, fileName)
}

/**
 * Helper function to parse a TOML config file
 * 
 * @param filePath 
 * @param fileName 
 * @returns 
 */
export const parseTomlConfig = (filePath: string, fileName: string): JsonMap => {
    const configPath = filePath + '/' + fileName
    return parse(fs.readFileSync(configPath, 'utf-8')) as JsonMap
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