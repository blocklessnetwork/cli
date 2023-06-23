import fs from "fs"
import Chalk from "chalk"
import { store } from "../../store"
import { execSync } from "child_process"
import { resolve } from "path"
import { parseBlsConfig } from "../../lib/blsConfig"
import { logger } from "../../lib/logger"
import { run as runBuild } from "./build"
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
    rebuild = false,
  } = options

  const runtimePath = `${systemPath}runtime/blockless-cli`

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
    let envString = ''

    if (!!options.env) {
      let envVars = [] as string[]
      let envVarsKeys = [] as string[]

      // Validate environment variables
      const vars = typeof options.env === 'string' ? [options.env] : options.env
      vars.map((v: string) => {
        const split = v.split('=')
        if (split.length !== 2) return

        envVars.push(v)
        envVarsKeys.push(split[0])
      })

      // Include environment string if there are variables
      if (envVars.length > 0) {
        envString = `env ${envVars.join(' ')} BLS_LIST_VARS=\"${envVarsKeys.join(';')}\"`
      }
    }

    const fastify = Fastify({
      logger: false,
      maxParamLength: 10000
    })

    await fastify.register(import('@fastify/rate-limit'), {
      max: 100,
      timeWindow: '1 minute'
    })

    fastify.get("*", async (request, reply) => {
      const result = execSync(`echo "${decodeURIComponent(request.url.trim())}" | ${envString} ${runtimePath} ${manifestPath}`, {
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
  } catch (error: any) {
    logger.error('Failed to invoke function.', error.message)
  }
}