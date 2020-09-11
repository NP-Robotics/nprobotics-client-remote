import awsIot from 'aws-iot-device-sdk';

class IOTDevice {
  constructor() {
    this.device = null;
    this.subscriptionCallbacks = {};
  }

  init({
    host,
    clientId,
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
      console.log('Receive');
      this.subscriptionCallbacks[topic](payload);
    });
  }

  disconnectDevice() {
    console.log('device ended');
    this.device.end();
  }

  publishMessage({ topic, payload }) {
    this.device.publish(topic, JSON.stringify(payload));
  }

  subscribeTopic({ topic, callback }) {
    this.device.subscribe(topic);
    this.subscriptionCallbacks[topic] = (payload) => callback(JSON.parse(payload.toString()));
  }

  unsubscribeTopic(topic) {
    this.device.unsubscribe(topic);
    delete this.subscriptionCallbacks[topic];
  }

  callService({ topic, callback, payload }) {
    const responseTopic = `${topic}/result`;
    this.subscribeTopic({
      topic: responseTopic,
      callback: (response) => {
        callback(response);
        this.unsubscribeTopic(responseTopic);
      },
    });
    this.publishMessage({ topic, payload });
  }
}

export default IOTDevice;
