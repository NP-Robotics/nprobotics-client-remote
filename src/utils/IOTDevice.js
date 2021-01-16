import awsIot from 'aws-iot-device-sdk';

class IOTDevice {
  constructor() {
    this.device = null;
    this.clientId = null;
    this.organisation = null;
    this.subscriptionCallbacks = {};
  }

  init({
    host,
    clientId,
    thingId,
    organisation,
    accessKeyId,
    secretKey,
    sessionToken,
    region,
    callback,
    error,
  }) {
    this.device = awsIot.device({
      host,
      clientId,
      protocol: 'wss',
      accessKeyId,
      secretKey,
      sessionToken,
      region,
    });

    this.clientId = thingId;
    this.organisation = organisation;

    this.device.on('connect', () => {
      console.log('connected!');
      callback();
    });
    this.device.on('error', (err) => {
      console.log('error', err);
      error(err);
    });
    this.device.on('offline', () => {
      console.log('offline');
      error();
    });
    this.device.on('reconnect', () => {
      console.log('reconnect');
      error();
    });
    this.device.on('message', (topic, payload) => {
      this.subscriptionCallbacks[topic](payload);
    });
  }

  disconnectDevice() {
    console.log('device ended');
    this.device.end();
  }

  topicWithClientId(topic) {
    return `${this.organisation}/${this.clientId}${topic}`;
  }

  publishMessage({ topic, payload }) {
    topic = this.topicWithClientId(topic);
    this.device.publish(topic, JSON.stringify(payload));
  }

  subscribeTopic({ topic, callback }) {
    topic = this.topicWithClientId(topic);
    this.device.subscribe(topic);
    this.subscriptionCallbacks[topic] = (payload) => callback(JSON.parse(payload.toString()));
  }

  unsubscribeTopic(topic) {
    topic = this.topicWithClientId(topic);
    this.device.unsubscribe(topic);
    delete this.subscriptionCallbacks[topic];
  }

  callService({ topic, callback, payload }) {
    const responseTopic = `${topic}/result`;
    this.subscribeTopic({
      topic: responseTopic,
      callback: (response) => {
        if (callback) {
          callback(response);
        }
        this.unsubscribeTopic(responseTopic);
      },
    });
    this.publishMessage({ topic, payload });
  }
}

export default IOTDevice;
