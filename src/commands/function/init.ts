import Chalk from "chalk";
import { store } from "../../store";
import { execSync } from "child_process";
import replace from "replace-in-file";
import { getNpmConfigInitVersion } from "../../lib/utils";

const sanitizer = /[^a-zA-Z0-9\-\.]/;

const sanitize = (input: string) => input.replace(sanitizer, "");

export const run = (options: any) => {
  const { name, path = ".", private: isPrivate } = options;
  const installationPath = `${sanitize(path)}/${sanitize(name)}`;
  const version = getNpmConfigInitVersion();
  const functionId = `blockless-function_${name}-${version}`; // TODO: standardize function  IDs

  //TODO: this is specific to asconfig.json, needs to be generalized for other scaffoldings
  const replaceTargetOptions = {
    files: `${installationPath}/asconfig.json`,
    from: [/debug/g, /release/g],
    to: [`${name}-debug`, name],
  };

  try {
    replace.sync(replaceTargetOptions);
  } catch (error) {
    console.log(Chalk.red(`Could not replace build target strings: ${error}`));
  }
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
