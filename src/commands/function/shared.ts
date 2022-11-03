import Chalk from 'chalk'
import { execSync } from "child_process"
import { existsSync, readFileSync } from "fs"
import { resolve } from 'path'
import { IBlsBuildConfig, IManifest } from "./interfaces"

export const getBuildDir = (path: string) => `${path}/build`

/**
 * Create a WASM archive
 * 
 * @param path 
 * @param wasmArchive 
 * @param wasmName 
 * @returns 
 */
export const createWasmArchive = (
  path: string,
  wasmArchive: string,
  wasmName: string
) => {
  console.log(`${Chalk.yellow(`Creating Archive:`)} ${wasmArchive} in ${path}`)
  execSync(`cd ${path} && tar zcf ./${wasmArchive} -C ${path} ${wasmName}`, {
    cwd: path,
    stdio: "ignore",
  })

  return readFileSync(`${path}/${wasmArchive}`)
}


/**
 * Build a WASM project based on the build config.
 * 
 * @param wasmName 
 * @param buildDir 
 * @param path 
 * @param buildConfig 
 * @param debug 
 */
export const buildWasm = (
  wasmName: string,
  buildDir: string,
  path: string,
  buildConfig: IBlsBuildConfig,
  debug: boolean) => {
  console.log(`${Chalk.yellow(`Building:`)} function ${wasmName} in ${buildDir}...`)

  if (buildConfig.command) {
    try {
      // Identify package manager
      const packageManager = buildConfig.command.split(" ", 2)[0]

      // Run install command
      switch (packageManager) {
        case 'npm':
          execSync(`npm install`, { cwd: path, stdio: 'ignore' })
          break

        case 'cargo':
          execSync(`cargo update`, { cwd: path, stdio: 'ignore' })
          break
      }
    } catch {}

    // Run build command
    execSync(buildConfig.command, {
      cwd: path,
      stdio: "inherit",
    })
  }

  // Modify 
  // TODO: See if we can shift this fallback to our template's build function
  const defaultWasm = debug ? "debug.wasm" : "release.wasm"
  if (existsSync(resolve(buildDir, defaultWasm))) {
    execSync(`cp ${defaultWasm} ${wasmName}`, { cwd: buildDir, stdio: "inherit" })
  }
}

/**
 * Create WASM manifest
 * 
 * @param buildDir 
 * @param entry 
 * @param url 
 * @param manifestOverride 
 * @returns 
 */
export const createWasmManifest = (
  buildDir: string,
  entry: string,
  url: string,
  manifestOverride = {}
): IManifest => {
  const name = entry.split(".")[0]

  const manifest: IManifest = {
    id: "",
    name,
    hooks: [],
    description: "",
    fs_root_path: "./",
    entry,
    runtime: {
      checksum: "",
      url,
    },
    contentType: "json",
    methods: [],
    permissions: [],
    ...manifestOverride
  }

  return manifest
}