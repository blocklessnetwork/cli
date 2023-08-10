// no types for this
// @todo typings file for this
import { store } from "./index";
import { existsSync, writeFileSync } from "fs";
import { execSync } from "child_process";

let db: any = null

export const getDb = () => {
  if (!db) {
    const lowdb = require("lowdb")
    const FileSync = require("lowdb/adapters/FileSync")
  
    const cliConfigFileName = "bls.cli.config.json"
    const cliConfigFilePath = `${store.system.homedir}${store.system.appPath}`
    const cliConfigFile = `${cliConfigFilePath}/${cliConfigFileName}`
  
    if (!existsSync(cliConfigFile)) {
      if (!existsSync(cliConfigFilePath)) {
        execSync(`mkdir -p ${cliConfigFilePath}`)
      }
      writeFileSync(cliConfigFile, JSON.stringify({}))
    }
  
    const defaultValue = {
      config: {
        token: "",
      },
    }
  
    const adapter = new FileSync(
      `${store.system.homedir}${store.system.appPath}/bls.cli.config.json`,
      { defaultValue }
    )
  
    db = lowdb(adapter);
  }

  return db.read()
};

// JWT retrieval
export const getToken = () => {
  const db = getDb();
  const config = db.get("config").value();
  const { token } = config || { token: null };
  
  return token;
};

export const getAuthUrl = (): { url: string, port: number } => {
  const db = getDb();
  const config = db.get("config").value();
  if (!config) return { url: 'dashboard.blockless.network', port: 443 }

  const { authUrl, authPort } = config
  return { url: authUrl, port: authPort }
}