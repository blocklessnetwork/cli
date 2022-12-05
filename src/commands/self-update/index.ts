import fs from "fs"
import path from "path"
import os from 'os'
import { execSync } from "child_process"
import { download } from "../../lib/binaries"
import { logger } from "../../lib/logger"

interface SelfUpdateCommandOptions {
  version: string
}

/**
 * Entry function for `bls self-update`
 * 
 * @param options 
 */
export const run = (options: SelfUpdateCommandOptions) => {
  try {
    // Parse GIT version
    let parsedVersion = parseVersion(options.version)

    // Execute self update script
    // TODO: Move installation script into CLI
    runSelfUpdate(parsedVersion)
  } catch (error: any) {
    console.log('Error:', error.message)
  }
}

/**
 * Parse version sent via GIT
 * 
 * @param version 
 * @returns 
 */
const parseVersion = (version: string) => {
  let parsedVersion

  const matches = version.match(/v?(\d+.\d+.\d+)/)

  if (version === 'latest') {
    parsedVersion = 'latest'
  } else if (matches && matches.length === 2) {
    parsedVersion = `v${matches[1]}`
  }

  if (!parsedVersion) throw new Error('Invalid GIT Version')

  return parsedVersion
}

/**
 * Install
 * 
 */
const runSelfUpdate = async (version: string) => {
  // Define tmp directory
  // Create tmp directory using node tmp dir creation with preix
  const tmpDir = fs.mkdtempSync(path.resolve(os.tmpdir(), 'bls-'))
  
  try {
    // Download installer script
    await download(
      `https://raw.githubusercontent.com/BlocklessNetwork/cli/main/download.sh`,
      path.resolve(tmpDir, 'download.sh')
    )

    // Copy over download script
    fs.chmodSync(path.resolve(tmpDir, 'download.sh'), '755')

    // Execute download script
    execSync(`sudo ./download.sh ${version}`, { cwd: tmpDir, stdio: 'inherit' })

    // Cleanup tmpDir
    fs.rmSync(tmpDir, { recursive: true, force: true })
  } catch (error: any) {
    fs.rmSync(tmpDir, { recursive: true, force: true })
    logger.error('Failed to sefl-update Blockless CLI, please try updating the CLI manually.', error.message)
  }
}