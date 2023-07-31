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
  "[POST] /functions": { params: { functionId?: string, functionName?: string } };
  "[GET] /functions/{id}": { params: { id: string } };
  "[DELETE] /functions/{id}": { params: { id: string } };
  "[PATCH] /functions/{id}": {
    params: { id: string; functionName?: string, functionId?: string; status?: string };
  };
  "[PUT] /functions/{id}/deploy": {
    params: { id: string; functionId?: string; functionName?: string };
  };
  "[GET] /sites": { params: {} };
  "[POST] /sites": { params: { functionId?: string, functionName?: string } };
  "[GET] /sites/{id}": { params: { id: string } };
  "[DELETE] /sites/{id}": { params: { id: string } };
  "[PATCH] /sites/{id}": {
    params: { id: string; functionName?: string; functionId?: string; status?: string };
  };
  "[PUT] /sites/{id}/deploy": {
    params: { id: string; functionId?: string; functionName?: string };
  };
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
  "[POST] /functions": {
    v0: {
      request: {
        method: "POST",
        url: "/api/modules/new",
      },
      dataParser: (data: GatewayEndpoints["[POST] /functions"]["params"]) => ({
        name: data.functionName,
        ...data,
      }),
    },
    v1: { request: { method: "POST", url: "/api/v1/functions" } },
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
  "[PATCH] /functions/{id}": {
    v0: {
      request: { method: "POST", url: "/api/modules/update" },
      dataParser: (
        data: GatewayEndpoints["[PATCH] /functions/{id}"]["params"]
      ) => ({ _id: data.id, name: data.functionName, ...data }),
    },
    v1: { request: { method: "PATCH", url: "/api/v1/functions/{id}" } },
  },
  "[PUT] /functions/{id}/deploy": {
    v0: {
      request: { method: "POST", url: "/api/modules/deploy" },
      dataParser: (
        data: GatewayEndpoints["[PUT] /functions/{id}/deploy"]["params"]
      ) => ({ userFunctionid: data.id, ...data }),
    },
    v1: { request: { method: "PUT", url: "/api/v1/functions/{id}/deploy" } },
  },
  "[GET] /sites": {
    v0: {
      request: {
        method: "GET",
        url: "/api/sites",
        params: { limit: 999 },
      },
    },
    v1: { request: { method: "GET", url: "/api/v1/sites" } },
  },
  "[POST] /sites": {
    v0: {
      request: {
        method: "POST",
        url: "/api/sites",
      },
    },
    v1: { request: { method: "POST", url: "/api/v1/sites" } },
  },
  "[GET] /sites/{id}": {
    v0: {
      request: {
        method: "GET",
        url: "/api/sites/{id}",
      },
    },
    v1: { request: { method: "GET", url: "/api/v1/sites/{id}" } },
  },
  "[DELETE] /sites/{id}": {
    v0: {
      request: { method: "DELETE", url: "/api/sites/{id}" },
    },
    v1: { request: { method: "DELETE", url: "/api/v1/sites/{id}/delete" } },
  },
  "[PATCH] /sites/{id}": {
    v0: {
      request: { method: "PATCH", url: "/api/sites/{id}" },
    },
    v1: { request: { method: "PATCH", url: "/api/v1/sites/{id}" } },
  },
  "[PUT] /sites/{id}/deploy": {
    v0: {
      request: { method: "PUT", url: "/api/sites/{id}/deploy" }
    },
    v1: { request: { method: "PUT", url: "/api/v1/functions/{id}/deploy" } },
  },
};

export function gatewayRequest<T extends GatewayEndpointType>(
  api: T,
  data?: GatewayEndpoints[T]["params"]
) {
  const map = gatewayAPIMapping[api]["v0"];
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

  console.log("rquest", request);

  return gatewayClient.request(request);
}
