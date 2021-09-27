const path = require('path')
const esbuild = require('esbuild')

esbuild
  .build({
    entryPoints: [path.join(__dirname, '../src/index.ts')],
    bundle: true,
    outfile: path.join(__dirname, '../dist/index.js'),
    platform: 'node',
    target: 'node14',
    minify: true,
    logLevel: 'info',
  })
  .catch(() => process.exit(1))
