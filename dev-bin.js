#!/usr/bin/env node
require("ts-node/register");
const compareVersions = require("compare-versions");
const MIN_NODE_VERSION = "14.17.6";

if (compareVersions.compare(process.versions.node, MIN_NODE_VERSION, "<")) {
	console.error(
		`Bls CLI requires at least node.js v${MIN_NODE_VERSION}.\nYou are using v${process.versions.node}. Please update your version of node.js. Consider using Node.js version manager https://github.com/nvm-sh/nvm.`,
	);
	process.exit(1);
} else {
	const { main } = require("./src/index");
	const { version } = require("./package.json");

	const runCLI = (args) => {
		main(args, { version });
	};

	// Export the runCLI function for testing
	module.exports = { runCLI };

	// Run the CLI if executed directly
	if (require.main === module) {
		runCLI(process.argv.slice(2));
	}
}
