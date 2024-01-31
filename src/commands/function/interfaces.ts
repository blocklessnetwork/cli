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
	name: string;
	version: string;

	deployment: {
		permission: "public" | "private";
		nodes: number;
	};
}
export interface IBlsConfig extends JsonMap {
	name: string;
	version: string;
	content_type: "text" | "html" | "json";

	deployment: IBlsDeployConfig;
	build: IBlsBuildConfig;
	build_release: IBlsBuildConfig;
}

export interface IBlsBuildConfig extends JsonMap {
	command: string;
	dir: string;
	public_dir: string;
	entry: string;
}

export interface IBlsDeployConfig extends JsonMap {
	nodes: number;
	permissions: string[];
}

// WASM interrfaces
export interface IWasmModule {
	file: string;
	name: string;
	type: string;
	md5: string;
}

// {"checksum":"de41ad2f4117974e4fabd176e42dcea6da5b3c53cc63855bd8a4dd00e4c6fd76","url":"eth-price-weights-calc.tar.gz"}
export interface IManifestRuntime {
	checksum: string;
	url: string;
}

export interface IManifest {
	id: string;
	version: number;
	name: string;
	description: string;
	fs_root_path: string;
	drivers_root_path?: string;
	runtime_logger: string;
	limited_fuel?: number;
	limited_memory?: number;
	runtime?: IManifestRuntime;
	entry: string;
	hooks?: [];
	modules?: IWasmModule[];
	contentType?: "json" | "html" | "text";
	permissions?: string[];
}

export interface IDeploymentOptions {
	functionId: string;
	functionName: string;
	userFunctionId: string;
}

type JsonArray = boolean[] | number[] | string[] | JsonMap[] | Date[];
type AnyJson =
	| boolean
	| number
	| string
	| JsonMap
	| Date
	| JsonArray
	| JsonArray[];

export interface JsonMap {
	[key: string]: AnyJson;
}
