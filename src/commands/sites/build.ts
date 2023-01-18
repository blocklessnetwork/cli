import Chalk from 'chalk'
import fs from 'fs'
import { resolve } from "path"
import { parseBlsConfig } from "../../lib/blsConfig"
import { logger } from "../../lib/logger"
import { createWasmArchive, createWasmManifest } from '../function/shared'
import { generateChecksum } from '../../lib/crypto'
import { buildSiteWasm } from './shared'

/**
 * Execute the `build` command line operation
 * 
 * @param options 
 * @returns void
 */
export const run = async (options: {
  path: string
  rebuild: boolean
  debug: boolean
}) => {
  const {
    debug = true,
    rebuild = true,
    path = process.cwd()
  } = options

  try {
    // Fetch BLS config
    const { name, content_type, deployment, build, build_release } = parseBlsConfig()

    // check for and store unmodified wasm file name to change later
    const buildConfig = !debug ? build_release : build
    const buildDir = resolve(path, buildConfig.dir || '.bls')
    const buildName = buildConfig.entry ? buildConfig.entry.replace('.wasm', '') : name
    const wasmName = buildConfig.entry || `${name}.wasm`
    const wasmArchive = `${buildName}.tar.gz`

    // Rebuild function if requested
    if (!fs.existsSync(resolve(buildDir, wasmName)) || rebuild) {
      buildSiteWasm(wasmName, buildDir, path, buildConfig, debug)
    } else if (fs.existsSync(resolve(buildDir, wasmName)) && !rebuild) {
      return
    }

    const wasmManifest = createWasmManifest(
      wasmName,
      wasmArchive,
      content_type
    )

    // Create a WASM archive
    const archive = createWasmArchive(buildDir, wasmArchive, wasmName)
    const checksum = generateChecksum(archive)

    // Include WASM checksum and entrypoint
    wasmManifest.runtime.checksum = checksum
    wasmManifest.methods?.push({
      name: wasmName.split(".")[0],
      entry: wasmName,
      result_type: "string",
    })

    // Store manifest
    fs.writeFileSync(`${buildDir}/manifest.json`, JSON.stringify(wasmManifest))

    console.log(`${Chalk.green('Build successful!')}`)
    console.log('')
  } catch (error: any) {
    logger.error('Failed to build site.', error.message)
    return
  }
}

const dynamicImport = async (path: string) => {
  console.log('dynamic import')

  try {
    const module = await import(path)
    return module.default
  } catch (err) {
    return console.error(err)
  }
};
