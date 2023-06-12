import Chalk from "chalk"
import { consoleClient } from "../../lib/http"
import { logger } from "../../lib/logger"

export const run = async () => {
  try {
    const { data } = await consoleClient.get(`/api/modules/mine`, {})
    const functions = data.docs ? data.docs : []

    logger.log('List of Functions:')
    logger.log('-----------------------------------')

    if (functions && functions.length > 0) {
      functions.forEach && functions.forEach((f: any) => {
        logger.log('')
        logger.log(`${Chalk.blue('Name:')}   ${f.functionName}`)
        logger.log(`${Chalk.blue('CID:')}    ${f.functionId}`)
        logger.log(`${Chalk.blue('Status:')} ${f.status === 'stopped' ? Chalk.red(f.status) : f.status === 'deployed' ? Chalk.green(f.status) : f.status}`)
      })

      logger.log('')
      logger.log(`Total Functions: ${functions.length}`)
    } else {
      logger.log('')
      logger.log('You have no functions.')
    }
  } catch (error: any) {
    logger.error('Failed to retrieve function list.', error.message)
    return
  }
}