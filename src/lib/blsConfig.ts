import fs from 'fs'
import { stringify, parse } from '@iarna/toml'
import { IBlsFunctionConfig, JsonMap } from '../commands/function/interfaces'

/**
 * Generate a base BLS function config
 * 
 */
interface BaseConfigParams {
    name: string
    version: string
    isPrivate: boolean
}
export const generateBaseConfig = (
    { name, version, isPrivate }: BaseConfigParams): JsonMap => {

    return {
        name,
        version,

        deployment: {
            permission: isPrivate ? 'private' : 'public',
            nodes: 4
        }
    }
}

/**
 * Helper function to parse a TOML config file
 * 
 * @param filePath 
 * @param fileName 
 * @returns 
 */
export const parseTomlConfig = (filePath = './', fileName = 'bls.toml'): JsonMap => {
    const configPath = filePath + '/' + fileName
    return parse(fs.readFileSync(configPath, 'utf-8'))
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