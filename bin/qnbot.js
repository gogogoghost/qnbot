#!/usr/bin/env node
"use strict";

require('../lib/cli')(process.argv);

process.on('SIGINT', function () {
    process.exit();
});