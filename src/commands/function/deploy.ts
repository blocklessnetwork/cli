import Chalk from "chalk";
import { getToken } from "../../store/db";
import axios from "axios";
import { IDeploymentOptions } from "./interfaces";
import { run as runPublish } from "./publish";
import { getConsoleServer } from "../../lib/utils";
import { basename, resolve } from "path";

const deploymentOptions: IDeploymentOptions = {
  functionId: "",
  functionName: "",
  userFunctionId: "",
};
const consoleServer = getConsoleServer();
const server = consoleServer;
const token = getToken();

//TODO: make this a lot better.
const deployFunction = (data: any) => {
  const { cid: functionId, name: functionName } = data;
  const { userFunctionId } = deploymentOptions;
  console.log(Chalk.yellow(`Deploying ${functionName}`));
  axios
    .post(
      `${server}/api/modules/new`,
      {
        functionId,
        name: functionName,
        userFunctionId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .then((res) => {
      if (res.data && res.data.success) {
        axios
          .post(
            `${server}/api/modules/deploy`,
            {
              functionName: functionName.replace(/\s+/g, "-"),
              functionId: functionId,
              userFunctionid: res.data._id,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )
          .then((res) => {
            console.log(
              Chalk.green(
                `Successfully deployed ${functionName} with id ${functionId}`
              )
            );
          })
          .catch((error) => {
            console.log("error publishing function", error);
          });
      }
    })
    .catch((error) => {
      console.log("error publishing function", error);
    });
};

export const run = (options: any) => {
  const {
    debug,
    name = basename(resolve(process.cwd())),
    path = process.cwd(),
    rebuild,
  } = options;

  const {
    bls: { functionId: userFunctionId, manifest },
  } = require(`${path}/package`);

  //TODO: this is absolutely monstrous and needs sanity applied
  deploymentOptions.userFunctionId = userFunctionId;

  runPublish({
    debug,
    name,
    path,
    publishCallback: deployFunction,
    rebuild,
    manifest,
  });
};
