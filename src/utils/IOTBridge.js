import awsIot from 'aws-iot-device-sdk';
import ROSLIB from 'roslib';

class IOTBridge {
  constructor() {
    this.device = null;
    this.ros = null;
    this.subscriptionCallbacks = {};
    this.subscribersROS = {};
    this.publishersROS = {};
    this.servicesROS = {};
  }

  initROS({
    url,
    bridgeConfig,
    callback,
  }) {
    this.ros = new ROSLIB.Ros({
      url,
    });

    this.ros.on('connection', () => {
      console.log('Connected to ROSBridge server.');
      callback();
    });

    this.ros.on('error', (error) => {
      console.log('Error connecting to ROSBridge server: ', error);
    });

    this.ros.on('close', () => {
      console.log('Connection to ROSBridge server closed.');
    });

    bridgeConfig.subscribers.forEach(
      ({ topic, type }, index) => {
        this.subscriberBridge({
          topic,
          type,
        });
      },
    );

    bridgeConfig.publishers.forEach(
      ({ topic, type }, index) => {
        this.publisherBridge({
          topic,
          type,
        });
      },
    );

    bridgeConfig.services.forEach(
      ({ topic, type }, index) => {
        this.RosServiceBridge({
          topic,
          type,
        });
      },
    );
  }

  initIOT({
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
      this.subscriptionCallbacks[topic](payload);
    });
  }

  cleanup() {
    this.disconnectDevice();
    this.cleanupRos();
  }

  disconnectDevice() {
    console.log('device ended');
    this.device.end();
  }

  cleanupRos() {
    this.ros.close();
    delete this.subscribersROS;
    delete this.publishersROS;
    delete this.servicesROS;
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
        if (callback) {
          callback(response);
        }
        this.unsubscribeTopic(responseTopic);
      },
    });
    this.publishMessage({ topic, payload });
  }

  // util function to subscibe to messages on ROS with callback
  subscribeTopicRos({ topic, type, callback }) {
    if (this.subscribersROS[topic] == null) {
      this.subscribersROS[topic] = new ROSLIB.Topic({
        ros: this.ros,
        name: topic,
        messageType: type,
      });

      this.subscribersROS[topic].subscribe(callback);
    } else {
      console.log('Topic bridge already active.');
    }
  }

  // util function to publish messages to ROS
  publishTopicRos({ topic, type, message }) {
    if (this.publishersROS[topic] == null) {
      this.publishersROS[topic] = new ROSLIB.Topic({
        ros: this.ros,
        name: topic,
        messageType: type,
      });
    } else {
      this.publishersROS[topic].publish(new ROSLIB.Message(message));
    }
  }

  // util function to call service in ROS
  serviceCallRos({
    topic, type, message, callback,
  }) {
    if (this.servicesROS[topic] == null) {
      this.servicesROS[topic] = new ROSLIB.Service({
        ros: this.ros,
        name: topic,
        serviceType: type,
      });
    } else {
      this.servicesROS[topic].callService(new ROSLIB.ServiceRequest(message), callback);
    }
  }

  // subscribe to ROS, publish to IOT Core
  subscriberBridge({ topic, type }) {
    this.subscribeTopicRos({
      topic,
      type,
      callback: (payload) => {
        this.publishMessage({
          topic,
          payload,
        });
      },
    });
  }

  // subscribe to IOT Core, publish to ROS
  publisherBridge({ topic, type }) {
    this.subscribeTopic({
      topic,
      callback: (payload) => {
        this.publishTopicRos({
          topic,
          type,
          message: payload,
        });
      },
    });
  }

  // implement service calls to ROS, return result via /topic/result in IOT Core
  RosServiceBridge({ topic, type }) {
    this.subscribeTopic({
      topic,
      callback: (payload) => {
        this.serviceCallRos({
          topic,
          type,
          payload,
          callback: (response) => {
            this.publishMessage({
              topic: `${topic}/result`,
              payload: response,
            });
          },
        });
      },
    });
  }
}

export default IOTBridge;
