import Chalk from 'chalk'
import os from 'os'
import fs, { existsSync } from "fs"
import path, { resolve } from "path"
import { execSync } from "child_process"
import { IBlsBuildConfig } from "../function/interfaces"
import { getDirectoryContents } from '../../lib/dir'

interface IFunctionRoute {
  path: string
  name: string
  exportedFunctions: string[]
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
export const buildSiteWasm = async (
  wasmName: string,
  buildDir: string,
  path: string,
  buildConfig: IBlsBuildConfig,
  debug: boolean) => {
  console.log(`${Chalk.yellow(`Building:`)} site ${wasmName} in ${buildDir}...`)

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

    // Run framework build command
    execSync(buildConfig.command, {
      cwd: path,
      stdio: "inherit"
    })
  }

  // Compile wasm for blockless site
  const publicDir = resolve(path, buildConfig.public_dir || 'out')

  return await doCompile(wasmName, publicDir, buildDir)
}

/**
 * Helper function to compile
 * 
 * @param source 
 * @param dest 
 * @returns 
 */
const doCompile = (name: string, source: string, dest: string = path.resolve(process.cwd(), '.bls')) => {
  return new Promise<{ entry: string, routes: IFunctionRoute[] }>(async (resovle, reject) => {
    try {
      // Detect routes
      const functionsPath = path.resolve(dest, '..', 'assembly', 'routes')
      const routes = [] as IFunctionRoute[]
      
      if (fs.existsSync(functionsPath)) {
        const files = fs.readdirSync(functionsPath)
        files.map(f => {
          if (f.endsWith('.ts')) {
            routes.push({
              name: f.replace('.ts', ''),
              path: f,
              exportedFunctions: ['GET', 'POST']
            })
          }
        })
      }

      // Build individual routes first
      console.log('')
      routes.map(r => {
        try {
          console.log(`${Chalk.yellow(`Compiling route:`)} ${r.path} ...`)
          execSync(`asc ${r.path} -o ../../.bls/${r.name}.wasm --exportStart _initialize`, { cwd: functionsPath })
        } catch (error) {
          console.log('Failed to build function', r.path)
        }
      })
      
      // Pack files and generate a tempory assembly script
      const { dir } = generateCompileDirectory(source, dest, routes)
      
      console.log('')
      console.log(`${Chalk.yellow(`Generating site:`)} at ${dest} ...`)
      execSync(`npm install && npm run build -- -o ${path.resolve(dest, name)}`, {
        cwd: dir
      })
      console.log('')

      // Clear temp source files
      fs.rmSync(dir, { recursive: true, force: true })

      resovle({
        entry: path.resolve(dest, name),
        routes
      })
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
const generateCompileDirectory = (source: string, dest: string, routes: IFunctionRoute[]): { dir: string, file: string } => {
  const sources = packFiles(source)
  let assetsContent = ''
  let routesImport = ''
  let routesContent = ''

  for (const s in sources) {
    assetsContent += `assets.set("${s}", "${sources[s]}")\n`
  }

  for (const r in routes) {
    const route = routes[r]

    route.exportedFunctions.map(f => {
      routesImport += `@external("${route.name}", "${f}")\n`
      routesImport += `declare function ${f}_${route.name}(req: i64): i64\n`
      routesImport += `\n`

      routesContent += `if (method === '${f}' && req.url === '/${route.name}') { response = ${f}_${route.name}(1).toString() } else `
    })
  }

  const packageJsonScript = `{
  "scripts": {
    "build": "asc index.ts --config asconfig.json"
  },
  "dependencies": {
    "@assemblyscript/wasi-shim": "^0.1.0",
    "@blockless/sdk": "https://github.com/blocklessnetwork/sdk-assemblyscript/#33818777aa7d226339a699af95288e64981a0d5c",
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
      "debug": true
    },
    "release": {
      "outFile": "release.wasm",
      "optimizeLevel": 3,
      "shrinkLevel": 0,
      "converge": false,
      "noAssert": false
    }
  }
}`
  
  const script = `
import { http } from "@blockless/sdk/assembly"
const assets = new Map<string,string>()

// Assets
${assetsContent}

// Routes
${routesImport}

/**
 * HTTP Component serving static html text
 * 
 */
http.HttpComponent.serve((req: http.Request) => {
  let response: string = '404 not found.'
  let status: u32 = 404
  let contentType: string = 'text/html'
  let method: string = 'GET'

  if (req.url === '/' && assets.has('/index.html')) {
    req.url = '/index.html'
  }

  if (!assets.has(req.url) && assets.has(req.url + '.html')) {
    req.url = req.url + '.html'
  }
  
  ${routesContent}if (assets.has(req.url)) {
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
})`

  // const tempDir = fs.mkdtempSync(path.resolve(os.tmpdir(), 'bls-'))
  if (!fs.existsSync(dest)) fs.mkdirSync(dest)

  const buildDir = path.resolve(dest, 'build')
  const buildEntryDir = path.resolve(buildDir, 'entry')
  if (!fs.existsSync(buildDir)) fs.mkdirSync(buildDir)

  if (fs.existsSync(buildEntryDir)) fs.rmSync(buildEntryDir, { recursive: true })
  fs.mkdirSync(buildEntryDir)

  const filePath = path.resolve(buildEntryDir, 'index.ts')

  fs.writeFileSync(filePath, script)
  fs.writeFileSync(path.resolve(buildEntryDir, 'asconfig.json'), asConfigScript)
  fs.writeFileSync(path.resolve(buildEntryDir, 'package.json'), packageJsonScript)

  return {
    dir: buildEntryDir,
    file: filePath
  }
}