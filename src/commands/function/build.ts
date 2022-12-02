import fs from "fs"
import Chalk from 'chalk'
import { resolve } from "path"
import { writeFileSync } from "fs"
import { buildWasm, createWasmArchive, createWasmManifest } from "./shared"
import { parseBlsConfig } from "../../lib/blsConfig"
import { generateChecksum } from "../../lib/crypto"

/**
 * Execute the `build` command line operation
 * 
 * @param options 
 * @returns void
 */
export const run = (options: {
  path: string
  debug: boolean
  rebuild: boolean
}) => {
  const {
    debug = true,
    path = process.cwd(),
    rebuild = true
  } = options

  // Fetch BLS config
  const { name, deployment, build, build_release } = parseBlsConfig()

  // check for and store unmodified wasm file name to change later
  const buildConfig = !debug ? build_release : build
  const deployConfig = deployment
  const buildName = buildConfig.entry ? buildConfig.entry.replace('.wasm', '') : name
  const buildDir = resolve(path, buildConfig.dir || 'build')
  const wasmName = buildConfig.entry || `${name}.wasm`
  const wasmArchive = `${buildName}.tar.gz`

  // Rebuild function if requested or 
  if (!fs.existsSync(resolve(buildDir, wasmName)) || rebuild) {
    buildWasm(wasmName, buildDir, path, buildConfig, debug)
  } else if (fs.existsSync(resolve(buildDir, wasmName)) && !rebuild) {
    return
  }

  // Generate a default WASM manifest
  const wasmManifest = createWasmManifest(
    buildDir,
    wasmName,
    wasmArchive
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

  if (deployConfig) {
    wasmManifest.permissions = deployConfig.permissions || []
  }

  // Store manifest
  writeFileSync(`${buildDir}/manifest.json`, JSON.stringify(wasmManifest))

  // Show success message
  console.log(`${Chalk.green('Build successful!')}`)
  console.log('')
}
