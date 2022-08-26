import { execSync } from "child_process";
import { readFileSync } from "fs";
import { getDb } from "../store/db";

// API Server
export const getConsoleServer = (
  location: "local" | "remote" = "remote",
  port?: number
) => {
  const devMode = process.env.NODE_ENV === "development";
  const local = location === "local";
  const host = local ? "http://localhost" : "https://console.bls.dev";
  return `${host}:${port ? port : devMode && local ? 3000 : 443}`;
};

// JWT retrieval

export const getTokenFromStore = () => {
  const db = getDb();
  const config = db.get("config").value();
  const { token } = config?.value() || { token: null };
  return token;
};

// Node/npm config
export const getNpmConfigInitVersion = (): string =>
  execSync("npm config get init-version").toString("utf-8");
