import Chalk from "chalk";
import { store } from "../../store";
import { execSync } from "child_process";
import {
  getConsoleServer,
  getNpmConfigInitVersion,
  getTokenFromStore,
} from "../../lib/utils";
import axios from "axios";
import { IBlsFunction } from "./interfaces";

const sanitizer = /[^a-zA-Z0-9\-]/;

const sanitize = (input: string) => input.replace(sanitizer, "");

const consoleServer = getConsoleServer();
const token = getTokenFromStore();

const saveNewFunction = (functionProps: IBlsFunction, cb?: Function) => {
  const { functionId, name } = functionProps;
  axios
    .post(
      `${consoleServer}/api/modules/new`,
      {
        functionId,
        name,
      },
      {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    )
    .then((res) => {
      if (cb) {
        cb(res.data);
      }
    })
    .catch((error) => {
      console.log("error saving function", error);
    });
};

export const run = (options: any) => {
  const {
    name,
    path = `${store.system.homedir}/.bls`,
    private: isPrivate,
  } = options;
  const installationPath = `/${sanitize(path)}/${sanitize(name)}`;
  const version = getNpmConfigInitVersion();
  const functionId = `blockless-function_${name}-${version}`; // TODO: standardize function  IDs

  // initialize new local project
  console.log(
    Chalk.yellow(
      `Initializing new function in ${installationPath} with ID ${functionId}`
    )
  );

  execSync(
    `mkdir -p ${installationPath};
    cd ${installationPath};
    npm init @blockless/app; npm pkg set name=${name} private=${Boolean(
      isPrivate
    ).toString()} "bls.functionId"=${functionId}`,
    {
      stdio: "inherit",
    }
  );
  console.log(
    Chalk.green(
      `Initialization of function ${installationPath} completed successfully`
    ) // because I said so in the absence of actual verification :D
  );

  // upload new project
  // check auth token validity; how?
  // tbd
  // if (token is valid) then
  saveNewFunction({ functionId, name }, ({ _id }: any) => {
    console.log(`Saved function in console successfully, id: ${_id}`);
  });
};
