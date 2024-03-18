/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-extraneous-dependencies */
const { build } = require('esbuild');
const { Generator } = require('npm-dts');
const { dependencies, peerDependencies } = require('./package.json');

const outdir = '.build';

const sharedConfig = {
  entryPoints: ['src/index.ts'],
  bundle: true,
  minify: true,
  external: Object.keys(dependencies).concat(Object.keys(peerDependencies)),
};

build({
  ...sharedConfig,
  platform: 'node',
  outfile: `${outdir}/index.js`,
});

const generateTypes = async () => {
  await new Generator(
    {
      entry: 'src/index.ts',
      output: `${outdir}/index.d.ts`,
      logLevel: 'debug',
      force: true,
    },
    true,
    true
  ).generate();
};

generateTypes();
