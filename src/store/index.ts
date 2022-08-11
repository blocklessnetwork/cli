import { platform } from "process";
import os from "os";

export const store: any = {
  system: {
    platform: platform,
    arch: process.arch,
    homedir: os.homedir(),
    appPath: "/.bls",
  },
  opts: {},
};

export const set = (key: string, value: any) => {
  store[key] = value;
};

export const get = (key: string) => {
  return store[key];
};
