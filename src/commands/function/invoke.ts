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

export const run = async (options: any) => {
  const {
    systemPath = `${store.system.homedir}/.bls/`,
    path = process.cwd(),
    debug = true,
    rebuild = true,
    stdin = []
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
    manifest.entry = resolve(buildDir, manifest.entry)
    fs.writeFileSync(manifestPath, JSON.stringify(manifest))

    // prepare environment variables
    // pass environment variables to bls runtime
    let envString = ''
    let stdinString = ''

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

      // Include stdin commands
      if (stdin.length > 0) {
        stdinString = stdin.join(' ')
      }
    }

    // pass in stdin to the runtime
    execSync(`echo "${stdinString}" | ${envString} ${runtimePath} ${manifestPath}`, {
      cwd: path,
      stdio: "inherit",
    })
  } catch (error: any) {
    logger.error('Failed to invoke function.', error.message)
  }
}
