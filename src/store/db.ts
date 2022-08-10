// no types for this
// @todo typings file for this
import { store } from "./index";

const lowdb = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const lowdbEncryption = require("lowdb-encryption");

const adapter = new FileSync(
  `${store.system.homedir}${store.system.appPath}/bls.cli.config.json`,
  {
    ...lowdbEncryption({
      secret: "s3cr3t",
      iterations: 100_000,
    }),
  }
);

const db = lowdb(adapter);

export const getDb = async () => {
  await db.read();
  db.data ||= { config: { token: "" } };
  return db;
};
