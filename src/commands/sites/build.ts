import Chalk from 'chalk'
import { resolve } from "path"
import { parseBlsConfig } from "../../lib/blsConfig"
import { logger } from "../../lib/logger"

import { packFiles } from "../../lib/packer"

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
    const publicDir = resolve(path, buildConfig.public_dir || 'out')

    // Pack public directory
    packFiles(publicDir, `${buildDir}/sources.ts`)

    // Show success message
    console.log(`${Chalk.green('Build successful!')}`)
    console.log('')
  } catch (error: any) {
    logger.error('Failed to build site.', error.message)
    return
  }
}
