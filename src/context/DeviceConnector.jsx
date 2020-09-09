import React, {
  useState, useRef, useEffect, createContext,
} from 'react';

import awsIot from 'aws-iot-device-sdk';
import PropTypes from 'prop-types';

export const DeviceContext = createContext(null);

const DeviceProvider = ({ children }) => {
  const [device, setDevice] = useState(null);
  const [thingShadow, setThingShadow] = useState(null);

  const initDevice = ({ payload, callback, error }) => {
    try {
      const _device = awsIot.device({
        host: payload.host,
        clientId: payload.clientId,
        protocol: 'wss',
        accessKeyId: payload.accessKeyId,
        secretKey: payload.secretKey,
        sessionToken: payload.sessionToken,
        region: 'us-east-1',
        debug: true,
      });
      _device.on('connect', () => {
        console.log('connected!');
        callback();
      });
      _device.on('error', (err) => {
        console.log('error', err);
        error(err);
      });
      _device
        .on('offline', () => {
          console.log('offline');
          error();
        });
      _device
        .on('reconnect', () => {
          console.log('reconnect');
          error();
        });
      setDevice(_device);
    } catch (err) {
      error(err);
    }
  };

  const disconnectDevice = () => {
    if (device) {
      device.end();
    }
    setDevice(null);
    console.log('ended');
    console.log('my device', device);
  };

  const publishMessage = ({ topic, payload }) => {
    if (device) {
      try {
        device.publish(topic, JSON.stringify(payload));
      } catch (err) {
        console.log(err);
      }
    }
  };

  const initThingShadow = ({ payload, callback, error }) => {
    try {
      const _thingShadow = awsIot.thingShadow({
        host: payload.host,
        clientId: payload.clientId,
        protocol: 'wss',
        accessKeyId: payload.accessKeyId,
        secretKey: payload.secretKey,
        sessionToken: payload.sessionToken,
        region: 'us-east-1',
        debug: true,
      });
      _thingShadow.on('connect', () => {
        _thingShadow.register('ChimeListener', {}, () => {
          const chimeListenerState = { state: { desired: { status: true } } };
          const clientTokenUpdate = _thingShadow.update('ChimeListener', chimeListenerState);
          if (clientTokenUpdate === null) {
            console.log('update shadow failed, operation still in progress');
          }
        });
      });

      _thingShadow.on('status',
        (thingName, stat, clientToken, stateObject) => {
          console.log(`received ${stat} on ${thingName}: ${
            JSON.stringify(stateObject)}`);
        });

      _thingShadow.on('delta',
        (thingName, stateObject) => {
          console.log(`received delta on ${thingName}: ${
            JSON.stringify(stateObject)}`);
        });

      _thingShadow.on('timeout',
        (thingName, clientToken) => {
          console.log(`received timeout on ${thingName
          } with token: ${clientToken}`);
        });
      setThingShadow(_thingShadow);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <DeviceContext.Provider value={{
      device,
      thingShadow,
      initDevice,
      disconnectDevice,
      publishMessage,
      initThingShadow,
    }}
    >
      {children}
    </DeviceContext.Provider>
  );
};

DeviceProvider.propTypes = {
  children: PropTypes.shape({}),
};

DeviceProvider.defaultProps = {
  children: {},
};

export default DeviceProvider;
