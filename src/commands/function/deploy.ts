import Chalk from "chalk";
import { getToken } from "../../store/db";
import axios from "axios";
import { IDeploymentOptions } from "./interfaces";
import { run as runPublish } from "./publish";

const deploymentOptions: IDeploymentOptions = {
  functionId: "",
  functionName: "",
  userFunctionId: "",
};

const server = "https://console.bls.dev";
const token = getToken();

//TODO: make this a lot better.
const deployFunction = (data: any) => {
  const { cid: functionId, name: functionName } = data;
  const { userFunctionId } = deploymentOptions;
  console.log(Chalk.yellow(`Deploying ${functionName}`));
  axios
    .post(
      `${server}/api/modules/deploy`,
      {
        functionId,
        functionName,
        userFunctionId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .then((res) => {
      console.log(res);
    })
    .catch((error) => {
      console.log("error publishing function", error);
    });
};

export const run = (options: any) => {
  const { debug, name, path, rebuild } = options;
  const {
    bls: { functionId: userFunctionId },
  } = require(`${path}/package`);

  //TODO: this is absolutely monstrous and needs sanity applied
  deploymentOptions.userFunctionId = userFunctionId;

  runPublish({ debug, name, path, publishCallback: deployFunction, rebuild });
};
