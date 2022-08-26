const { cli } = require("./dist/src/index");
const { version } = require("./package.json");

cli(process.argv, { version });
