// @flow
const {getManifest} = require('../utils/get-manifest.js');
const {getAllDependencies} = require('../utils/get-all-dependencies.js');
const {read, write} = require('../utils/node-helpers.js');
const {shouldSync, getVersion} = require('../utils/version-onboarding.js');
const {install} = require('./install.js');
const sortPackageJson = require('../utils/sort-package-json');

/*::
type AlignArgs = {
  root: string,
  cwd: string,
}
type Align = (AlignArgs) => Promise<void>
*/
const align /*: Align */ = async ({root, cwd}) => {
  const {projects, versionPolicy} = /*:: await */ await getManifest({root});
  if (versionPolicy) {
    const deps = await getAllDependencies({root, projects});
    const meta = JSON.parse(await read(`${cwd}/package.json`, 'utf8'));
    const others = deps.filter(dep => dep.meta.name !== meta.name);
    const types = ['dependencies', 'devDependencies', 'resolutions'];
    let changed = false;
    for (const type of types) {
      if (meta[type]) {
        for (const name in meta[type]) {
          if (shouldSync({versionPolicy, name})) {
            const version = getVersion({name, deps: others});
            if (version !== '') {
              meta[type][name] = version;
              changed = true;
            }
          }
        }
      }
    }
    if (changed) {
      await write(`${cwd}/package.json`, sortPackageJson(meta), 'utf8');
    }
  }
  await install({root, cwd, conservative: true});
};

module.exports = {align};
