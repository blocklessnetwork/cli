import { execSync } from "child_process";

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

// Node/npm config
export const getNpmConfigInitVersion = (): string =>
  execSync("npm config get init-version").toString("utf-8");
