import Chalk from "chalk"
import { logger } from "../../lib/logger"
import { gatewayRequest } from "../../lib/gateway"
import { getGatewayDeploymentUrl } from "../../lib/urls"

export const run = async () => {
  try {
    const { data } = await gatewayRequest("[GET] /sites");
    const sites = data.docs ? data.docs : []

    logger.log('List of Sites:')
    logger.log('-----------------------------------')

    if (sites && sites.length > 0) {
      sites.forEach && sites.forEach((f: any) => {
        const domain = getGatewayDeploymentUrl(f.subdomain, f.domainMappings)

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