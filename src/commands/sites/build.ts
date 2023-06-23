import fs from 'fs'
import Chalk from 'chalk'
import { resolve } from "path"
import { parseBlsConfig } from "../../lib/blsConfig"
import { logger } from "../../lib/logger"
import { createWasmArchive, createWasmManifest } from '../function/shared'
import { generateMd5Checksum } from '../../lib/crypto'
import { buildSiteWasm } from './shared'
import { slugify } from '../../lib/strings'

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
    path = process.cwd(),
    rebuild = true
  } = options

  try {
    // Fetch BLS config
    const { name, content_type, deployment, build, build_release } = parseBlsConfig()

    // check for and store unmodified wasm file name to change later
    const buildConfig = !debug ? build_release : build
    const deployConfig = deployment
    const buildName = buildConfig.entry ? slugify(buildConfig.entry.replace('.wasm', '')) : slugify(name)
    const buildDir = resolve(path, buildConfig.dir || '.bls')
    const wasmName = buildConfig.entry || `${name}.wasm`
    const wasmArchive = `${buildName}.tar.gz`

    // Rebuild function if requested
    if (!fs.existsSync(resolve(buildDir, wasmName)) || rebuild) {
      buildSiteWasm(wasmName, buildDir, path, buildConfig, debug)
    } else if (fs.existsSync(resolve(buildDir, wasmName)) && !rebuild) {
      return
    }

    // Generate a default WASM manifest
    const wasmManifest = createWasmManifest(wasmName, content_type)

    // Create a WASM archive
    createWasmArchive(buildDir, wasmArchive, wasmName)

    wasmManifest.modules?.push({
      file: wasmName,
      name: wasmName.split(".")[0],
      type: 'entry',
      md5: generateMd5Checksum(fs.readFileSync(`${buildDir}/${wasmName}`))
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