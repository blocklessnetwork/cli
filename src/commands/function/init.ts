import Chalk from "chalk";
import { execSync } from "child_process";

const sanitizer = /[^a-zA-Z0-9]/;

const sanitize = (input: string) => input.replace(sanitizer, "");

export const run = (options: any) => {
  const { name, path } = options;
  const installationPath = `/${sanitize(path)}/${sanitize(name)}`;

  console.log(Chalk.yellow(`Initializing new function in ${installationPath}`));
  execSync(
    `mkdir -p ${installationPath}; cd ${installationPath}; npm init @blockless/app`,
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
