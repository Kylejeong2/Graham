// eslint-disable-next-line @typescript-eslint/no-var-requires
const esbuild = require("esbuild");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createBuildSettings } = require("./settings.js");

const settings = createBuildSettings();

esbuild.build(settings);