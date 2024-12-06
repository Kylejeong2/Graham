/* eslint-disable @typescript-eslint/no-var-requires */
const esbuildPluginTsc = require("esbuild-plugin-tsc");

function createBuildSettings(options) {
  return {
    loader: { ".node": "copy" },
    platform: "node",
    entryPoints: ["index.ts"],
    // outfile: "dist/index.js",
    bundle: true,
    sourcemap: true,
    outdir: "dist",
    plugins: [
      esbuildPluginTsc({
        force: true,
      }),
    ],
    ...options,
  };
}

module.exports.createBuildSettings = createBuildSettings;