import Chalk from "chalk";
import { store } from "../../store";
import { execSync } from "child_process";
import replace from "replace-in-file";
import { getNpmConfigInitVersion } from "../../lib/npm";
import prompt from "prompt";
import {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} from "unique-names-generator";

prompt.start();
prompt.message = "";
prompt.delimiter = ":";

const { resolve } = require("path");

const sanitizer = /[^a-zA-Z0-9\-]/;

const sanitize = (input: string) => input.replace(sanitizer, "");

const checkForNpm = () => {
  try {
    execSync("npm --version", { stdio: "ignore" });
    return true;
  } catch (e) {
    return false;
  }
};

const randomName = uniqueNamesGenerator({
  dictionaries: [adjectives, colors, animals],
}); // big_red_donkey

export const run = (options: any) => {
  const {
    name = randomName,
    path = process.cwd(),
    private: isPrivate,
    yes = false,
  } = options;

  if (!checkForNpm()) {
    console.log(
      Chalk.red(`[error]`),
      `npm is required to run this command, please install it and try again\n`,
      `npm is a development dependency of the function you are trying to create\n`,
      "install npm: https://github.com/nvm-sh/nvm#install--update-script"
    );

    console.log(" ");
    if (!yes) {
      prompt.get(
        {
          properties: {
            install: {
              description: Chalk.yellow(`install nodejs and npm? (Y/n)`),
              required: false,
              default: "y",
            },
          },
        },
        function (err: any, result: any) {
          if (err) {
            console.log(err);
          }
          if (result.install === "Y" || result.install === "y") {
            execSync(
              `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash`,
              { stdio: "ignore" }
            );
            execSync(
              `export NVM_DIR="$HOME/.nvm"
            [ -s "$NVM_DIR/nvm.sh" ] && \. $NVM_DIR/nvm.sh && nvm install 18`
            );
            try {
              execSync(
                `export NVM_DIR="$HOME/.nvm"
            [ -s "$NVM_DIR/nvm.sh" ] && \. $NVM_DIR/nvm.sh && npm --version`,
                { stdio: "ignore" }
              );
            } catch (e) {
              console.log(
                Chalk.red(
                  `[error] unable to install npm/node please try manually`
                )
              );
            }
            console.log(
              "developmenmt tools installed, please restart this terminal session, or run the following command before trying again"
            );
            console.log("");
            console.log(
              `export NVM_DIR="$HOME/.nvm"\n[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" `
            );
          }
        }
      );
    }
    console.log("");
    return;
  }

  const installationPath = resolve(
    process.cwd(),
    `${path}`,
    sanitize(`${name}`)
  );
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
    `${Chalk.blue("Initializing")} new function in \n${Chalk.yellow(
      installationPath
    )} \nwith ID ${functionId}`
  );

  execSync(
    `mkdir -p ${installationPath};
    cd ${installationPath};
    npm init @blockless/app; npm pkg set name=${name} private=${Boolean(
      isPrivate
    ).toString()} "bls.functionId"=${functionId}`,
    {
      stdio: "ignore",
    }
  );
  console.log(
    `Initialization of function\n${Chalk.blue(
      installationPath
    )}\ncompleted ${Chalk.green("successfully")}`
  );
  console.log("");
  console.log(`change into the directory\n${installationPath}\nto get started`);
};
