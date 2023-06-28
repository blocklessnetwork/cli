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
    const deployConfig = deployment
    const buildDir = resolve(path, buildConfig.dir || '.bls')
    const buildName = buildConfig.entry ? buildConfig.entry.replace('.wasm', '') : name
    const wasmName = buildConfig.entry || `${name}.wasm`
    const wasmArchive = `${buildName}.tar.gz`

    // Bail if file is present and rebuild is not requested
    if (fs.existsSync(resolve(buildDir, wasmName)) && !rebuild) {
      return
    }

    const wasmManifest = createWasmManifest(
      wasmName,
      wasmArchive,
      content_type
    )

    // Build site WASM
    await buildSiteWasm(wasmName, buildDir, path, buildConfig, debug)

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

    if (deployConfig) {
      wasmManifest.permissions = deployConfig.permissions || []
    }

    // Store manifest
    fs.writeFileSync(`${buildDir}/manifest.json`, JSON.stringify(wasmManifest))

    console.log(`${Chalk.green('Build successful!')}`)
    console.log('')
  } catch (error: any) {
    logger.error('Failed to build site.', error.message)
    return
  }
}