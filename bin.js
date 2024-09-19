#!/usr/bin/env node --no-warnings
const compareVersions = require("compare-versions");


const { main } = require("./dist/src/index");
const { version } = require("./package.json");

main(process.argv.slice(2), { version });

