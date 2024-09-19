#!/usr/bin/env node --no-warnings
require("ts-node/register");

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