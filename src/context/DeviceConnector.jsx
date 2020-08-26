import React, {
  useState, useRef, useEffect, useContext, createContext,
} from 'react';

import awsIot from 'aws-iot-device-sdk';
import PropTypes from 'prop-types';

export const DeviceContext = createContext(null);

const DeviceProvider = ({ children }) => {
  const [state, setState] = useState({
    device: null,
    initDevice,
    disconnectDevice,
    publishMessage,
  });

  const initDevice = ({ payload, callback, error }) => {
    try {
      const device = awsIot.device({
        host: payload.host,
        clientId: payload.clientId,
        protocol: 'wss',
        accessKeyId: payload.accessKeyId,
        secretKey: payload.secretKey,
        sessionToken: payload.sessionToken,
        region: 'us-east-1',
        debug: true,
      });
      device.on('connect', () => {
        console.log('connected!');
        callback();
      });
      device.on('error', (err) => {
        console.log('error', err);
        error(err);
      });
      device
        .on('offline', () => {
          console.log('offline');
          error();
        });
      device
        .on('reconnect', () => {
          console.log('reconnect');
          error();
        });
      setState({
        device,
        ...state,
      });
    } catch (err) {
      error(err);
    }
  };

  const disconnectDevice = () => {
    state.device.end();
    delete state.device;
  };

  const publishMessage = (topic, payload) => {
    if (state.device) {
      try {
        state.device.publish(topic, JSON.stringify(payload));
      } catch (err) {
        console.log(err);
      }
    }
  };

  return (
    <DeviceContext.Provider value={state}>
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
