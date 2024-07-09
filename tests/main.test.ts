import { join } from "path";
import pkg from "../package.json";

const cliPath = join(__dirname, "../dev-bin.js");

// Import the runCLI function
const { runCLI } = require(cliPath);

describe("CLI Tests", () => {
	it("should provide the version in the package.json", async () => {
		const output = await new Promise((resolve, reject) => {
			const log = console.log;
			let output = "";
			console.log = (message) => (output += message);
			try {
				runCLI(["-v"]);
				console.log = log; // Restore console.log
				resolve(output);
			} catch (error) {
				console.log = log; // Restore console.log
				reject(error);
			}
		});

		expect(output).toBe(pkg.version);
	});
});
