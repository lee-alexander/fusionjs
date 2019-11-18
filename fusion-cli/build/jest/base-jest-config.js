/** Copyright (c) 2018 Uber Technologies, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

/* eslint-env node */
const fs = require('fs');
const {dirname} = require('path');
const loadFusionRC = require('../load-fusionrc.js');

const rootDir = dirname(fs.realpathSync(`${process.cwd()}/package.json`));

const {jest: jestConfig, jsExtPattern} = loadFusionRC(rootDir);
const testFileExt = jsExtPattern ? jsExtPattern.source : '\\.js$';

const TRANSFORM_IGNORE_PATTERNS = ['/node_modules/(?!(fusion-cli.*build))'];
const matchField = process.env.TEST_REGEX ? 'testRegex' : 'testMatch';
const matchValue = process.env.TEST_FOLDER
  ? [`**/${process.env.TEST_FOLDER || '__tests__'}/**/*${testFileExt}`]
  : process.env.TEST_REGEX ||
    (process.env.TEST_MATCH || `**/__tests__/**/*${testFileExt}`).split(',');

function getReactVersion() {
  // $FlowFixMe
  const meta = require(rootDir + '/package.json');
  const react =
    (meta.dependencies && meta.dependencies.react) ||
    (meta.devDependencies && meta.devDependencies.react) ||
    (meta.peerDependencies && meta.peerDependencies.react);
  return react
    .split('.')
    .shift()
    .match(/\d+/);
}

function getReactSetup() {
  try {
    return [require.resolve(`./jest-framework-setup-${getReactVersion()}.js`)];
  } catch (e) {
    return [];
  }
}

const reactSetup = getReactSetup();

const transformIgnorePatterns =
  (jestConfig && jestConfig.transformIgnorePatterns) ||
  TRANSFORM_IGNORE_PATTERNS;

module.exports = {
  coverageDirectory: `${rootDir}/coverage`,
  coverageReporters: ['json'],
  rootDir,
  transform: {
    [testFileExt]: require.resolve('./jest-transformer.js'),
    '\\.(gql|graphql)$': require.resolve('./graphql-jest-transformer.js'),
  },
  transformIgnorePatterns,
  setupFiles: [require.resolve('./jest-framework-shims.js'), ...reactSetup],
  setupFilesAfterEnv: jestConfig && jestConfig.setupFilesAfterEnv,
  snapshotSerializers:
    reactSetup.length > 0 ? [require.resolve('enzyme-to-json/serializer')] : [],
  [matchField]: matchValue,
  testURL: 'http://localhost:3000/',
  collectCoverageFrom: [
    `src/**/*${testFileExt}`,
    '!**/__generated__/**',
    '!**/__integration__/**',
    '!**/__tests__/**',
    '!**/node_modules/**',
    ...(process.env.COVERAGE_PATHS
      ? process.env.COVERAGE_PATHS.split(',')
      : []),
  ],
  testResultsProcessor: require.resolve('./results-processor.js'),
};
