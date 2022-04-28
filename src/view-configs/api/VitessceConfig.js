import semver from 'semver';
import { VitessceConfig as VitessceConfigV1 } from './v1';
import { VitessceConfig as VitessceConfigV2 } from './v2';

/**
 * Class representing a Vitessce view config.
 */
export class VitessceConfig {
  /**
   * Construct a new view config instance.
   * @param {string} schemaVersion The view config schema version. Required.
   * @param {string} name A name for the config. Optional.
   * @param {string} description A description for the config. Optional.
   */
  constructor(schemaVersion, name = undefined, description = undefined) {
    if (schemaVersion && semver.lt(schemaVersion, '2.0.0')) {
      return new VitessceConfigV1(name, description, schemaVersion);
    }
    return new VitessceConfigV2(schemaVersion, name, description);
  }

  /**
   * Create a VitessceConfig instance from an existing view config, to enable
   * manipulation with the JavaScript API.
   * @param {object} config An existing Vitessce view config as a JSON object.
   * @returns {VitessceConfig} A new config instance, with values set to match
   * the config parameter.
   */
  static fromJSON(config) {
    const { name, description, version: schemaVersion } = config;
    if (schemaVersion && semver.lt(schemaVersion, '2.0.0')) {
      return VitessceConfigV1.fromJSON(name, description, schemaVersion);
    }
    return VitessceConfigV2.fromJSON(name, description, schemaVersion);
  }
}
