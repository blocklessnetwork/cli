// Blocklesss interfaces
export interface IBlsFunction {
  functionId: string;
  name: string;
}
export interface IBlsFunctionRequiredOptions {
  init: string[];
  deploy: string[];
  publish: string[];
  update: string[];
}
export interface IBlsFunctionConfig {
  name: string
  version: string

  deployment: {
    permission: 'public' | 'private'
    nodes: number
  }
}

// WASM interrfaces
export interface IWasmMethod {
  name: string;
  entry: string;
  result_type: string;
}

export interface IManifest {
  id: string;
  name: string;
  description: string;
  fs_root_path: string;
  limited_fuel?: number;
  limited_memory?: number;
  entry: string;
  resouces?: [];
  hooks?: [];
  runtime: {
    checksum: string;
    url: string;
  };
  contentType?: "json" | "html" | "text";
  resources?: string[];
  methods?: IWasmMethod[];
}

export interface IDeploymentOptions {
  functionId: string;
  functionName: string;
  userFunctionId: string;
}

type JsonArray = boolean[] | number[] | string[] | JsonMap[] | Date[]
type AnyJson = boolean | number | string | JsonMap | Date | JsonArray | JsonArray[]

export interface JsonMap {
  [key: string]: AnyJson
}
