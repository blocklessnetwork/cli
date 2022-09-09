import { execSync } from "child_process";

// Node/npm config
export const getNpmConfigInitVersion = (): string =>
  execSync("npm config get init-version").toString("utf-8");
