import uuidv4 from 'uuid/v4';
// eslint-disable-next-line vitessce-rules/prevent-pubsub-import
import PubSub from 'pubsub-js';

/**
 * A loader ancestor class containing a default constructor
 * and a stub for the required load() method.
 */
export default class AbstractLoader {
  constructor({
    type, url, requestInit,
  }) {
    this.type = type;
    this.url = url;
    this.requestInit = requestInit;

    this.subscriptions = [];
    this.uuid = uuidv4();
  }

  // eslint-disable-next-line class-methods-use-this
  load() {
    throw new Error('The load() method has not been implemented.');
  }

  subscribe(subscriber) {
    return PubSub.subscribe(this.uuid, subscriber);
  }

  // eslint-disable-next-line class-methods-use-this
  unsubscribe(token) {
    PubSub.unsubscribe(token);
  }

  publish(data) {
    PubSub.publish(this.uuid, data);
  }
}
