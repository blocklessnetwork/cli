#!/usr/bin/env node
require("ts-node/register");
const { cli } = require("./src/index");
cli(process.argv);
