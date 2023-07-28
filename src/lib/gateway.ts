import axios, { AxiosRequestConfig } from "axios";
import { getToken } from "../store/db";
import { getGatewayUrl } from "./urls";

export const gatewayClient = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request interceptor to pass in JWT bearer token
 *
 */
gatewayClient.interceptors.request.use(
  async (config) => {
    const token = getToken();
    const gatewayUrl = getGatewayUrl();

    config.baseURL = gatewayUrl;

    if (token) {
      config.headers = {
        ...config.headers,
        authorization: `Bearer ${token}`,
      };
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor
 *
 */
gatewayClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (
      error.response.status === 401 &&
      error.response.data &&
      error.response.data.error === "Unauthorized"
    ) {
      return Promise.reject(
        new Error(
          "Authorization token has expired, run `bls login` to re-authenticate."
        )
      );
    }

    return Promise.reject(error);
  }
);

export type GatewayEndpoints = {
  "[GET] /functions": { params: {} };
  "[GET] /functions/{id}": { params: { id: string } };
  "[DELETE] /functions/{id}": { params: { id: string } };
};

export type GatewayEndpointType = keyof GatewayEndpoints;
export type GatewayAPIVersion = "v0" | "v1";

export const gatewayAPIMapping: {
  [key in GatewayEndpointType]: {
    [key in GatewayAPIVersion]: {
      request: Partial<AxiosRequestConfig>;
      dataParser?: (data: any) => any;
    };
  };
} = {
  "[GET] /functions": {
    v0: {
      request: {
        method: "GET",
        url: "/api/modules/mine",
        params: { limit: 999 },
      },
    },
    v1: { request: { method: "GET", url: "/api/v1/functions" } },
  },
  "[GET] /functions/{id}": {
    v0: {
      request: {
        method: "GET",
        url: "/api/modules/mine",
        params: { limit: 999 },
      },
    },
    v1: { request: { method: "GET", url: "/api/v1/functions/{id}" } },
  },
  "[DELETE] /functions/{id}": {
    v0: {
      request: { method: "POST", url: "/api/modules/delete" },
      dataParser: (
        data: GatewayEndpoints["[DELETE] /functions/{id}"]["params"]
      ) => ({ _id: data.id }),
    },
    v1: { request: { method: "DELETE", url: "/api/v1/functions/{id}/delete" } },
  },
};

export function gatewayRequest<T extends GatewayEndpointType>(
  api: T,
  data?: GatewayEndpoints[T]["params"]
) {
  const map = gatewayAPIMapping[api]["v1"];
  const url = data
    ? Object.entries(data as { [key: string]: any }).reduce(
        (str, [key, value]) =>
          str && str.replace(new RegExp(`{${key}}`, "g"), value),
        map.request.url
      )
    : map.request.url;

  const request: AxiosRequestConfig = {
    ...map.request,
    url,
    data: !!map.dataParser ? map.dataParser(data) : data,
  };

  return gatewayClient.request(request);
}
