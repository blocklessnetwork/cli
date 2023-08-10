import fs from "fs"
import Chalk from "chalk"
import { store } from "../../store"
import { execSync } from "child_process"
import { run as runBuild } from "./build"
import { resolve } from "path"
import { parseBlsConfig } from "../../lib/blsConfig"
import { logger } from "../../lib/logger"
import { run as runInstall } from "../offchain/install"
import prompRuntimeConfirm from "../../prompts/runtime/confirm"
import Fastify from "fastify"
import { openInBrowser } from "../../lib/browser"
import { getPortPromise } from "portfinder";

export const run = async (options: any) => {
  const {
    systemPath = `${store.system.homedir}/.bls/`,
    path = process.cwd(),
    debug = true,
    rebuild = true,
    stdin = [],
    serve = false
  } = options

  const runtimePath = `${systemPath}runtime/bls-runtime`

  // Validate Runtime Path
  try {
    if (!fs.existsSync(runtimePath)) {
      const { confirm } = await prompRuntimeConfirm()

      if (!confirm) {
        throw new Error("Cancelled by user, aborting invoke.")
      } else {
        await runInstall({ yes: true, inline: true })
        console.log(Chalk.green('Installation successful!'))
        console.log('')
        console.log('')
      }
    }
  } catch (error) {
    logger.error('Failed to install blockless runtime, please try installing the runtime manually.')
    return
  }

  try {
    // Fetch BLS config
    const { build, build_release } = parseBlsConfig()

    // Execute the build command
    runBuild({ path, debug, rebuild })

    // check for and store unmodified wasm file name to change later
    const buildConfig = !debug ? build_release : build
    const buildDir = resolve(path, buildConfig.dir || 'build')
    const manifestPath = resolve(buildDir, 'manifest.json')

    // the runtime requires absolute paths
    let manifestData = fs.readFileSync(manifestPath, "utf8")
    let manifest = JSON.parse(manifestData)
    manifest.drivers_root_path = `${systemPath}/extensions`
    manifest.modules = manifest.modules.map((m: any) => {
      m.file = resolve(buildDir, m.file)
      return m
    })
    fs.writeFileSync(manifestPath, JSON.stringify(manifest))

    // prepare environment variables
    // pass environment variables to bls runtime
    let stdinString = ''

    // Include stdin commands
    if (stdin.length > 0) {
      stdinString = stdin.join(' ')
    }

    if (serve) {
      const fastify = Fastify({
        logger: false,
        maxParamLength: 10000
      })

      await fastify.register(import('@fastify/rate-limit'), {
        max: 100,
        timeWindow: '1 minute'
      })

      fastify.all("*", async (request, reply) => {
        let qs = ''
        let headerString = ''
        let requestPath = decodeURIComponent(request.url.trim())

        if (requestPath.includes('?')) {
          qs = requestPath.split('?')[1]
          requestPath = requestPath.split('?')[0]
        }

        if (request.headers) {
          headerString = Object.entries(request.headers)
            .map(([key, value]) => `${key}=${value}`)
            .join('&')
        }

        let envString = ''
        let envVars = [] as string[]
        let envVarsKeys = [] as string[]
    
        if (!!options.env) {
          // Validate environment variables
          const vars = typeof options.env === 'string' ? [options.env] : options.env
          vars.map((v: string) => {
            const split = v.split('=')
            if (split.length !== 2) return
    
            envVars.push(v)
            envVarsKeys.push(split[0])
          })
        }    

        envVars.push(`BLS_REQUEST_PATH="${requestPath}"`)
        envVars.push(`BLS_REQUEST_QUERY="${qs}"`)
        envVars.push(`BLS_REQUEST_METHOD="${request.method}"`)
        envVars.push(`BLS_REQUEST_HEADERS="${headerString}"`)
        envVarsKeys.push('BLS_REQUEST_PATH')
        envVarsKeys.push('BLS_REQUEST_QUERY')
        envVarsKeys.push('BLS_REQUEST_METHOD')
        envVarsKeys.push('BLS_REQUEST_HEADERS')
        
        if (request.body) {
          envVars.push(`BLS_REQUEST_BODY="${JSON.stringify(request.body)}"`)
          envVarsKeys.push('BLS_REQUEST_BODY')
        }

        // Include environment string if there are variables
        if (envVars.length > 0) {
          envString = `env ${envVars.join(' ')} BLS_LIST_VARS=\"${envVarsKeys.join(';')}\"`
        }
        
        const result = execSync(`echo "${path}" | ${envString} ${runtimePath} ${manifestPath}`, {
          cwd: path
        }).toString()

        if (!manifest.contentType || manifest.contentType === 'json' && result) {
          try {
            const resultJson = JSON.parse(result)

            reply
              .header("Content-Type", "application/json")
              .send(resultJson)
          } catch (error) { }
        } else if (manifest.contentType === "html" && result) {
          const body = result

          if (body.startsWith("data:")) {
            const data = body.split(",")[1]
            const contentType = body.split(",")[0].split(":")[1].split(";")[0]
            const base64data = Buffer.from(data, "base64")
            reply.type(contentType).send(base64data)
          } else {
            reply
              .header("Content-Type", "text/html")
              .send(body)
          }
        } else {
          reply.send(result)
        }
      })

      const port = await getPortPromise({ port: 3000, stopPort: 4000 })

      fastify.listen({ port }).then(async () => {
        console.log(`Serving http://127.0.0.1:${port} ...`)
        openInBrowser(`http://127.0.0.1:${port}`)
      })
    } else {
      // pass in stdin to the runtime
      stdinString = stdinString.replace(/"/g, '\\"')

      let envString = ''
      let envVars = [] as string[]
      let envVarsKeys = [] as string[]
  
      if (!!options.env) {
        // Validate environment variables
        const vars = typeof options.env === 'string' ? [options.env] : options.env
        vars.map((v: string) => {
          const split = v.split('=')
          if (split.length !== 2) return
  
          envVars.push(v)
          envVarsKeys.push(split[0])
        })
      }  

      // Include environment string if there are variables
      if (envVars.length > 0) {
        envString = `env ${envVars.join(' ')} BLS_LIST_VARS=\"${envVarsKeys.join(';')}\"`
      }

      const result = execSync(`echo "${stdinString}" | ${envString} ${runtimePath} ${manifestPath}`, {
        cwd: path
      }).toString()

      console.log(result)
    }
  } catch (error: any) {
    logger.error('Failed to invoke function.', error.message)
  }
}