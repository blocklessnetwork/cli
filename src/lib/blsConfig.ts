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
            entry: `${name}-debug.wasm`,
            command: 'npm run build:debug'
        }

        defaultConfig.build_release = {
            dir: 'build',
            entry: `${name}-release.wasm`,
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
 * Helper function to parse a TOML config file
 * 
 * @param filePath 
 * @param fileName 
 * @returns 
 */
export const parseBlsConfig = (filePath = './', fileName = 'bls.toml'): IBlsConfig => {
    const configPath = filePath + '/' + fileName
    return parse(fs.readFileSync(configPath, 'utf-8')) as IBlsConfig
}

/**
 * Helper function to stringify and same a TOML file
 * 
 * @param json 
 * @param filePath 
 * @param fileName 
 * @returns 
 */
export const saveTomlConfig = (json: JsonMap, filePath = './', fileName = 'bls.toml') => {
    const configData = stringify(json)
    const configPath = filePath + '/' + fileName

    return fs.writeFileSync(configPath, configData, { flag: "w" })
}