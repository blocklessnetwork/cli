import axios from "axios";
import { getAuthUrl } from "../store/db";

// Console API Server
export const getConsoleServer = (port?: number) => {
  const devMode = process.env.NODE_ENV === "development";
  const host = devMode
    ? "http://0.0.0.0"
    : "https://dashboard.blockless.network";
  return `${host}:${port ? port : devMode ? 3005 : 443}`;
};

export const getGatewayUrl = (): string => {
  const authUrl = getAuthUrl();
  const protocol = authUrl.port === 443 ? "https" : "http";

  return authUrl
    ? authUrl.port === 443 || authUrl.port === 80
      ? `${protocol}://${authUrl.url}`
      : `${protocol}://${authUrl.url}:${authUrl.port}`
    : getConsoleServer();
};

export async function validateGatewayVersion(gatewayUrl: string) {
  let version = 0;

  try {
    const response = await axios.get(`${gatewayUrl}/version`);

    if (!!response.data.apiVersion) {
      version = response.data.apiVersion;
    }
  } catch (error) {}

  return version;
}

// WASI Repo Server
export const getWASMRepoServer = (port?: number) => {
  const devMode = process.env.NODE_ENV === "development";
  const host = devMode ? "http://0.0.0.0" : "https://wasi.bls.dev";
  return `${host}:${port ? port : devMode ? 3006 : 443}`;
};
