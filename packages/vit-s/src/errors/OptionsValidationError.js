import AbstractLoaderError from './AbstractLoaderError';

export default class OptionsValidationError extends AbstractLoaderError {
  constructor(fileType, url, options, reason) {
    super(
      `Error while validating file definition options: ${fileType} from ${url}.`,
    );
    this.name = 'OptionsValidationError';

    this.fileType = fileType;
    this.url = url;
    this.options = options;
    this.reason = reason;
  }

  warnInConsole() {
    const { options, reason } = this;
    console.warn(
      'Received options\n',
      JSON.stringify(options, null, 2),
      'JSON schema validation failure reason\n',
      JSON.stringify(reason, null, 2),
    );
  }
}
