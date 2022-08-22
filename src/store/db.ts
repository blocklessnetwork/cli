// no types for this
// @todo typings file for this
import { store } from "./index";
import { existsSync, writeFileSync } from "fs";
import { execSync } from "child_process";

const lowdb = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const lowdbEncryption = require("lowdb-encryption");

const cliConfigFileName = "bls.cli.config.json";
const cliConfigFilePath = `${store.system.homedir}${store.system.appPath}`;
const cliConfigFile = `${cliConfigFilePath}/${cliConfigFileName}`;

if (!existsSync(cliConfigFile)) {
  if (!existsSync(cliConfigFilePath)) {
    execSync(`mkdir -p ${cliConfigFilePath}`);
      writeFileSync(cliConfigFile, JSON.stringify({}));
}

const defaultValue = {
  config: {
    token: "",
  },
};

const adapter = new FileSync(
  `${store.system.homedir}${store.system.appPath}/bls.cli.config.json`,
  {
    defaultValue,
    ...lowdbEncryption({
      secret: "s3cr3t",
      iterations: 100_000,
    }),
  }

const adapter = new FileSync(cliConfigFile, {
  ...lowdbEncryption({
    secret: "s3cr3t",
    iterations: 100_000,
  }),
});

const db = lowdb(adapter);

export const getDb = () => db.read();
