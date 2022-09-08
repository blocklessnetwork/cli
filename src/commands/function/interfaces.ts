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
  runtime: {
    checksum: string;
    url: string;
  };
  resources?: string[];
  methods?: IWasmMethod[];
}

export interface IDeploymentOptions {
  functionId: string;
  functionName: string;
  userFunctionId: string;
}
