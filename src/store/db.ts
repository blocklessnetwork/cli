// no types for this
// @todo typings file for this
import { store } from "./index";

const lowdb = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const lowdbEncryption = require("lowdb-encryption");

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
);

const db = lowdb(adapter);

export const getDb = () => db.read();
