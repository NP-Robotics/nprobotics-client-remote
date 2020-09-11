import awsIot from 'aws-iot-device-sdk';

class IOTDevice {
  constructor() {
    this.device = null;
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
  }

  disconnectDevice() {
    console.log('device ended');
    this.device.end();
  }

  publishMessage({ topic, payload }) {
    this.device.publish(topic, JSON.stringify(payload));
  }
}

export default IOTDevice;
