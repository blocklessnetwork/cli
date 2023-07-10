import Chalk from "chalk"
import { consoleClient } from "../../lib/http"
import { logger } from "../../lib/logger"

export const run = async () => {
  try {
    const { data } = await consoleClient.get(`/api/sites?limit=999`, {})
    const sites = data.docs ? data.docs : []

    logger.log('List of Sites:')
    logger.log('-----------------------------------')

    if (sites && sites.length > 0) {
      sites.forEach && sites.forEach((f: any) => {
        const domain = 
          !!f.domainMappings && 
          f.domainMappings.length > 0 && 
          f.domainMappings[0].domain

        logger.log('')
        logger.log(`${Chalk.blue('Name:')}    ${f.functionName}`)
        
        if (domain) {
          logger.log(`${Chalk.blue('URL:')}     https://${domain}`)
        }
        
        logger.log(`${Chalk.blue('CID:')}     ${f.functionId}`)
        logger.log(`${Chalk.blue('Status:')}  ${f.status === 'stopped' ? Chalk.red(f.status) : f.status === 'deployed' ? Chalk.green(f.status) : f.status}`)
      })

      logger.log('')
      logger.log(`Total Sites: ${sites.length}`)
    } else {
      logger.log('')
      logger.log('You have no sites.')
    }
  } catch (error: any) {
    logger.error('Failed to retrieve site list.', error.message)
    return
  }
}