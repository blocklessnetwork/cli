#!/usr/bin/env node
require("ts-node/register");
const { cli } = require("./src/index");
const { version } = require("./package.json");
cli(process.argv, { version });
