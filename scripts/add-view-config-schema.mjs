import * as fs from 'fs';
import path from 'path';

const prevVersion = process.argv[2];
const nextVersion = process.argv[3];

const appSrc = path.resolve(fs.realpathSync(process.cwd()), "src");

// Copy schema
fs.copyFileSync(
    path.join(appSrc, "schemas", `config-${prevVersion}.schema.json`),
    path.join(appSrc, "schemas", `config-${nextVersion}.schema.json`)
);

// Move test
fs.copyFileSync(
    path.join(appSrc, "schemas", `config-${prevVersion}.schema.test.js`),
    path.join(appSrc, "schemas", `config-${nextVersion}.schema.test.js`)
);

fs.appendFileSync(
    path.join(appSrc, "app", "view-config-upgraders.js"),
    `

// Added in version ${nextVersion}:
// - TODO
export function upgradeFrom${prevVersion.replace(".", "_").replace(".", "_")}(config) {
    const newConfig = cloneDeep(config);

    return {
    ...newConfig,
    version: '${nextVersion}',
    };
}
`
);