import Chalk from 'chalk'
import os from 'os'
import fs, { existsSync } from "fs"
import path, { resolve } from "path"
import { execSync } from "child_process"
import { IBlsBuildConfig } from "../function/interfaces"
import { getDirectoryContents } from '../../lib/dir'

/**
 * Build a WASM project based on the build config.
 * 
 * @param wasmName 
 * @param buildDir 
 * @param path 
 * @param buildConfig 
 * @param debug 
 */
export const buildSiteWasm = async (
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

  // Compile wasm for blockless site
  const publicDir = resolve(path, buildConfig.public_dir || 'out')
  await doCompile(wasmName, publicDir, buildDir)

  // Modify 
  // TODO: See if we can shift this fallback to our template's build function
  const defaultWasm = debug ? "debug.wasm" : "release.wasm"
  if (existsSync(resolve(buildDir, defaultWasm))) {
    execSync(`cp ${defaultWasm} ${wasmName}`, { cwd: buildDir, stdio: "inherit" })
  }
}

/**
 * Helper function to compile
 * 
 * @param source 
 * @param dest 
 * @returns 
 */
const doCompile = (name: string, source: string, dest: string = path.resolve(process.cwd(), '.bls')) => {
  return new Promise(async (resovle, reject) => {
    try {
      // Pack files and generate a tempory assembly script
      const { dir } = generateCompileDirectory(source)
      
      execSync(`npm install && npm run build -- -o ${path.resolve(dest, name)}`, {
        cwd: dir
      })

      // Clear temp source files
      fs.rmSync(dir, { recursive: true, force: true })

      // Resolve release wasm
      resovle(path.resolve(dest, name))
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Read source folder's file recurrsively, pack all folder contents in a single .ts file
 * 
 * @param source 
 * @param dest 
 */
const packFiles = (source: string) => {
  const files = {} as { [key: string]: string }
  if (!!source && fs.existsSync(source) && fs.statSync(source).isDirectory()) {
    const contents = getDirectoryContents(source)

    for (const c in contents) {
      const fileName = c.replace(source, '')
      files[fileName] = contents[c]
    }
  }

  return files
}

/**
 * Generate a 
 * 
 * @param source 
 * @returns 
 */
const generateCompileDirectory = (source: string): { dir: string, file: string } => {
  const sources = packFiles(source)
  let assetsContent = ''

  for (const s in sources) {
    assetsContent += `assets.set("${s}", "${sources[s]}")\n`
  }

  const packageJsonScript = `{
  "scripts": {
    "build": "asc index.ts --config asconfig.json"
  },
  "dependencies": {
    "@assemblyscript/wasi-shim": "^0.1.0",
    "@blockless/sdk": "^1.1.0",
    "as-wasi": "^0.6.0"
  },
  "devDependencies": {
    "assemblyscript": "^0.25.0"
  }
}`

  const asConfigScript = `{
  "extends": "./node_modules/@assemblyscript/wasi-shim/asconfig.json",
  "targets": {
    "debug": {
      "outFile": "debug.wasm",
      "sourceMap": true,
      "debug": true
    },
    "release": {
      "outFile": "release.wasm",
      "sourceMap": true,
      "optimizeLevel": 3,
      "shrinkLevel": 0,
      "converge": false,
      "noAssert": false
    }
  },
  "options": {
    "bindings": "esm"
  }
}`
  
  const script = `
  import { http } from "@blockless/sdk/assembly"
  const assets = new Map<string,string>()
  
  ${assetsContent}

  /**
   * HTTP Component serving static html text
   * 
   */
  http.HttpComponent.serve((req: http.Request) => {
    let response: string = '404 not found.'
    let status: u32 = 404
    let contentType: string = 'text/html'

    if (req.url === '/' && assets.has('/index.html')) {
      req.url = '/index.html'
    }

    if (!assets.has(req.url) && assets.has(req.url + '.html')) {
      req.url = req.url + '.html'
    }
    
    if (assets.has(req.url)) {
      // Parse content type and format
      const content = assets.get(req.url) || '404 not found'

      if (content.startsWith('data:')) {
        const matchString = content.replace('data:', '')
        const matchTypeSplit = matchString.split(';')
        
        contentType = matchTypeSplit[0]
        response = matchTypeSplit[1]
      }

      response = assets.get(req.url) || '404 not found'
    }

    return new http.Response(response)
      .header('Content-Type', contentType)
      .status(status)
  })
  `
  const tempDir = fs.mkdtempSync(path.resolve(os.tmpdir(), 'bls-'))
  const filePath = path.resolve(tempDir, 'index.ts')

  fs.writeFileSync(filePath, script)
  fs.writeFileSync(path.resolve(tempDir, 'asconfig.json'), asConfigScript)
  fs.writeFileSync(path.resolve(tempDir, 'package.json'), packageJsonScript)

  return {
    dir: tempDir,
    file: filePath
  }
}