import Chalk from "chalk";
import { logger } from "../../lib/logger";
import { gatewayRequest } from "../../lib/gateway";
import { getGatewayDeploymentUrl } from "../../lib/urls"

export const run = async () => {
  try {
    const { data } = await gatewayRequest("[GET] /functions");
    const functions = data.docs ? data.docs : [];

    logger.log("List of Functions:");
    logger.log("-----------------------------------");

    if (functions && functions.length > 0) {
      functions.forEach &&
        functions.forEach((f: any) => {
          const domain = getGatewayDeploymentUrl(f.subdomain, f.domainMappings)

          logger.log("");
          logger.log(`${Chalk.blue("Name:")}    ${f.functionName}`);

          if (domain) {
            logger.log(`${Chalk.blue("URL:")}     https://${domain}`);
          }

          logger.log(`${Chalk.blue("CID:")}     ${f.functionId}`);
          logger.log(
            `${Chalk.blue("Status:")}  ${
              f.status === "stopped"
                ? Chalk.red(f.status)
                : f.status === "deployed"
                ? Chalk.green(f.status)
                : f.status
            }`
          );
        });

      logger.log("");
      logger.log(`Total Functions: ${functions.length}`);
    } else {
      logger.log("");
      logger.log("You have no functions.");
    }
  } catch (error: any) {
    logger.error("Failed to retrieve function list.", error.message);
    return;
  }
};
