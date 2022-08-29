import Chalk from "chalk";
import { store } from "../../store";
import { execSync } from "child_process";
import { getNpmConfigInitVersion } from "../../lib/utils";

const sanitizer = /[^a-zA-Z0-9\-]/;

const sanitize = (input: string) => input.replace(sanitizer, "");

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
};
