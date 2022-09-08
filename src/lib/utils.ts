import { execSync } from "child_process";

// Console API Server
export const getConsoleServer = (
  location: "local" | "remote" = "remote",
  port?: number
) => {
  const devMode = process.env.NODE_ENV === "development";
  const host = devMode ? "http://0.0.0.0" : "https://console.bls.dev";
  return `${host}:${port ? port : devMode ? 3005 : 443}`;
};

// WASI Repo Server
export const getWASMRepoServer = (
  location: "local" | "remote" = "remote",
  port?: number
) => {
  const devMode = process.env.NODE_ENV === "development";
  const host = devMode ? "http://0.0.0.0" : "https://wasi.bls.dev";
  return `${host}:${port ? port : devMode ? 3006 : 443}`;
};

// Node/npm config
export const getNpmConfigInitVersion = (): string =>
  execSync("npm config get init-version").toString("utf-8");
