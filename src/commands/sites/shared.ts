import Chalk from "chalk";
import os from "os";
import fs, { existsSync } from "fs";
import path, { resolve } from "path";
import { execSync } from "child_process";
import { IBlsBuildConfig } from "../function/interfaces";
import { copyFileSync, getDirectoryContents } from "../../lib/dir";
import { slugify } from "../../lib/strings";
import { getTsExportedFunctions } from "../../lib/sourceFile";

interface IFunctionRoute {
	path: string;
	url: string;
	nameSlug: string;
	name: string;
	wildcard: string | null;
	exportedFunctions: string[];
}

/**
 * Build a WASM project based on the build config.
 *
 * @param wasmName
 * @param buildDir
 * @param path
 * @param buildConfig
 * @param debug
 */
export const buildSiteWasm = async (
	wasmName: string,
	buildDir: string,
	path: string,
	buildConfig: IBlsBuildConfig,
	debug: boolean,
) => {
	console.log(
		`${Chalk.yellow(`Building:`)} site ${wasmName} in ${buildDir}...`,
	);

	if (buildConfig.command) {
		try {
			// Identify package manager
			const packageManager = buildConfig.command.split(" ", 2)[0];

			// Run install command
			switch (packageManager) {
				case "npm":
					execSync(`npm install`, { cwd: path, stdio: "ignore" });
					break;

				case "cargo":
					execSync(`cargo update`, { cwd: path, stdio: "ignore" });
					break;
			}
		} catch {}

		// Run framework build command
		execSync(buildConfig.command, {
			cwd: path,
			stdio: "inherit",
		});
	}

	// Compile wasm for blockless site
	const publicDir = resolve(path, buildConfig.public_dir || "out");

	return await doCompile(wasmName, publicDir, buildDir);
};

/**
 * Helper function to compile
 *
 * @param source
 * @param dest
 * @returns
 */
const doCompile = (
	name: string,
	source: string,
	dest: string = path.resolve(process.cwd(), ".bls"),
) => {
	return new Promise<string>(async (resovle, reject) => {
		try {
			// Pack files and generate a tempory assembly script
			console.log("");
			const { dir } = generateCompileDirectory(source, dest);

			console.log("");
			console.log(`${Chalk.yellow(`Generating site:`)} at ${dest} ...`);
			execSync(
				`npm install && npm run build -- -o ${path.resolve(dest, name)}`,
				{
					cwd: dir,
				},
			);
			console.log("");

			// Clear temp source files
			fs.rmSync(dir, { recursive: true, force: true });

			resovle(path.resolve(dest, name));
		} catch (error) {
			reject(error);
		}
	});
};

/**
 * Read source folder's file recurrsively, pack all folder contents in a single .ts file
 *
 * @param source
 * @param dest
 */
const packFiles = (source: string) => {
	const files = {} as { [key: string]: string };
	if (!!source && fs.existsSync(source) && fs.statSync(source).isDirectory()) {
		const contents = getDirectoryContents(source);

		for (const c in contents) {
			const fileName = c.replace(source, "");
			files[fileName] = contents[c];
		}
	}

	return files;
};

/**
 * Read source folder's routes and pack dynamic routes
 *
 * @param source
 */
const packRoutes = (source: string, dest: string) => {
	const functionsPath = path.resolve(source, "..", "assembly", "routes");
	const routes = [] as IFunctionRoute[];

	/**
	 * Traverse through the given directory recursively
	 * and fill in route details
	 * @param dirPath
	 */
	const traverseRoutes = (dirPath: string) => {
		const files = fs.readdirSync(dirPath);

		files.forEach((file) => {
			const filePath = path.join(dirPath, file);

			if (fs.statSync(filePath).isDirectory()) {
				traverseRoutes(filePath);
			} else if (file.endsWith(".ts")) {
				// Check whether exported functions exist
				const exportedFunctions = getTsExportedFunctions(filePath);
				if (!exportedFunctions || exportedFunctions.length === 0) return;

				// Fetch file name and path
				const name = file.replace(".ts", "");
				let relativePath = filePath.replace(functionsPath, "");
				let url = relativePath.replace(".ts", "");

				// Test wheather the route is a wildcard or a static route
				let wildcardParam = null;
				const isWildcard = /^\[.*\]$/.test(name);

				// If the route is a wildcard route, update path references
				if (isWildcard) {
					const matches = name.match(/\[(.*?)\]/g);
					if (matches && matches.length > 0) {
						wildcardParam = matches[0].slice(1, -1);
						relativePath = relativePath.replace(
							matches[0],
							`wildcard_${wildcardParam}`,
						);
						url = url
							.replace(`wildcard_${wildcardParam}`, "")
							.replace(name, "");
					}
				}

				// Handle index routes without the index path
				if (url.endsWith("/index")) {
					url = url.replace(new RegExp("/index$"), "");
				}

				// Clear out all leading slashes
				if (relativePath.startsWith("/")) {
					relativePath = relativePath.substring(1);
				}

				// Fill in the route details
				routes.push({
					name: slugify(name),
					path: relativePath,
					url,
					nameSlug: relativePath
						.replace(".ts", "")
						.replace("[", "")
						.replace("]", "")
						.replace(new RegExp(path.sep, "g"), "__"),
					wildcard: isWildcard ? wildcardParam : null,
					exportedFunctions: getTsExportedFunctions(filePath),
				});

				// Move route to the build folder
				console.log(`${Chalk.yellow(`Compiling route:`)} ${relativePath} ...`);
				copyFileSync(filePath, path.resolve(dest, relativePath));
			}
		});
	};

	// Look through all routes and fill in route definations
	if (fs.existsSync(functionsPath)) {
		traverseRoutes(functionsPath);
	}

	// Sort routes to place all wildcard routes at the end,
	// Allowing for static nested routes along with wildcards
	routes.sort((r1, r2) => {
		if (!!r1.wildcard && !r2.wildcard) {
			return 1;
		} else if (!r1.wildcard && !!r2.wildcard) {
			return -1;
		} else {
			return 0;
		}
	});

	return routes;
};

/**
 * Generate assets and directory for compiling the blockless site
 *
 * @param source
 * @returns
 */
const generateCompileDirectory = (
	source: string,
	dest: string,
): { dir: string; file: string } => {
	// Create working directories
	if (!fs.existsSync(dest)) fs.mkdirSync(dest);
	const buildDir = path.resolve(dest, "build");
	const buildEntryDir = path.resolve(buildDir, "entry");
	const buildRoutesDir = path.resolve(buildEntryDir, "routes");
	if (!fs.existsSync(buildDir)) fs.mkdirSync(buildDir);
	if (fs.existsSync(buildEntryDir))
		fs.rmSync(buildEntryDir, { recursive: true });
	fs.mkdirSync(buildEntryDir);
	if (!fs.existsSync(buildRoutesDir)) fs.mkdirSync(buildRoutesDir);

	// Prepare static files and dynamic routes
	const sources = packFiles(source);
	const routes = packRoutes(dest, buildRoutesDir);

	let assetsContent = "";
	let routesImport = "";
	let routesContent = "";

	for (const s in sources) {
		assetsContent += `assets.set("${s}", "${sources[s]}")\n`;
	}

	for (const r in routes) {
		const route = routes[r];
		routesImport += `import * as bls_route_${route.nameSlug} from './routes/${route.path}'\n`;

		route.exportedFunctions.map((f) => {
			if (!!route.wildcard) {
				routesContent += `if (method === '${f}' && validateWildcardRoute(req.url, '${route.url}')) { req.query.set('${route.wildcard}', extractWildcardParam(req.url, '${route.url}')); response = bls_route_${route.nameSlug}.${f}(req).toString() } else `;
			} else {
				routesContent += `if (method === '${f}' && validateRoute(req.url, '${route.url}')) { response = bls_route_${route.nameSlug}.${f}(req).toString() } else `;
			}
		});
	}

	const packageJsonScript = `{
  "scripts": {
    "build": "asc index.ts --config asconfig.json"
  },
  "dependencies": {
    "@assemblyscript/wasi-shim": "^0.1.0",
    "@blockless/sdk": "github:blocklessnetwork/sdk-assemblyscript",
    "as-wasi": "^0.6.0"
  },
  "devDependencies": {
    "assemblyscript": "^0.25.0"
  }
}`;

	const asConfigScript = `{
  "extends": "./node_modules/@assemblyscript/wasi-shim/asconfig.json",
  "targets": {
    "release": {
      "outFile": "release.wasm",
      "optimizeLevel": 3,
      "shrinkLevel": 0,
      "converge": false,
      "noAssert": false
    }
  }
}`;

	const script = `
import { http } from "@blockless/sdk/assembly"
const assets = new Map<string,string>()

// Assets
${assetsContent}

// Routes
${routesImport}

// Helper functions
function validateRoute(url: string, route: string): boolean {
  return url === route
}

function validateWildcardRoute(url: string, routePart: string): boolean {
  const part = url.replace(routePart, '')
  return url.startsWith(routePart) && !!part && part.indexOf('/') === -1
}

function extractWildcardParam(url: string, routePart: string): string {
  return url.replace(routePart, '')
}

/**
 * HTTP Component serving static html text
 * 
 */
http.HttpComponent.serve((req: http.Request) => {
  let response: string = '404 not found.'
  let status: u32 = 404
  let contentType: string = 'text/html'
  let method: string = req.method || 'GET'

  let url = req.url
  let urlWithoutSlash = url.endsWith('/') ? url.slice(0, -1) : url

  // Serve the index file for the homepage
  if (url === '/' && assets.has('/index.html')) {
    url = '/index.html'
  }

  // Serve nested index.html for any folder route
  // Serve matching html for a non html route 
  if (!assets.has(urlWithoutSlash) && assets.has(urlWithoutSlash + '/index.html')) {
    url = urlWithoutSlash + '/index.html'
  } else if (!assets.has(urlWithoutSlash) && assets.has(urlWithoutSlash + '.html')) {
    url = urlWithoutSlash + '.html'
  }
  
  // Match assets and serve data
  ${routesContent}if (assets.has(url)) {
    // Parse content type and format
    const content = assets.get(url)

    if (content.startsWith('data:')) {
      const matchString = content.replace('data:', '')
      const matchTypeSplit = matchString.split(';')
      
      contentType = matchTypeSplit[0]
    }

    response = assets.get(url)
    status = 200
  } else if (assets.has('/404.html')) {
    response = assets.get('/404.html')
  }

  return new http.Response(response)
    .header('Content-Type', contentType)
    .status(status)
})`;

	const filePath = path.resolve(buildEntryDir, "index.ts");

	fs.writeFileSync(filePath, script);
	fs.writeFileSync(
		path.resolve(buildEntryDir, "asconfig.json"),
		asConfigScript,
	);
	fs.writeFileSync(
		path.resolve(buildEntryDir, "package.json"),
		packageJsonScript,
	);

	return {
		dir: buildEntryDir,
		file: filePath,
	};
};
