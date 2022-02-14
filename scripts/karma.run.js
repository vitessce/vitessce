// References:
// - https://github.com/gzuidhof/zarr.js/blob/master/test/globalSetup.js
// - https://stackoverflow.com/questions/64877507/karma-startup-and-teardown-config
// - http://karma-runner.github.io/6.3/dev/public-api.html#karmaconfig
const karma = require('karma');
const path = require('path');
const express = require("express");
const cors = require('cors');

const isAutoWatch = process.argv[2] == "--auto-watch";

async function setup() {
    const app = express();
    app.use(cors());
    app.use(express.static("src/loaders/fixtures", { dotfiles: 'allow' }));
    const server = app.listen(8080);
    return server;
}

async function run() {
    const configPath = path.join(__dirname, './karma.config.js');
    const karmaConfig = karma.config.parseConfig(configPath, {
        autoWatch: isAutoWatch,
        singleRun: !isAutoWatch,
    });

    const expressServer = await setup();
    const karmaServer = new karma.Server(karmaConfig, () => {
        expressServer.close();
    });
    karmaServer.start();
}

run();