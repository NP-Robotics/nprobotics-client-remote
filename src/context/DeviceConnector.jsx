import React, {
  useState, useRef, useEffect, createContext,
} from 'react';

import awsIot from 'aws-iot-device-sdk';
import PropTypes from 'prop-types';

export const DeviceContext = createContext(null);

const DeviceProvider = ({ children }) => {
  const [device, setDevice] = useState(null);

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

  const thingShadow = ({payload, callback, error}) => {
    try {
    const awsIot = require('aws-iot-device-sdk');
    const thingShadows = awsIot.thingShadow({
     clientId: payload.clientId,
         host: payload.host,
    });
    const clientTokenUpdate;
    thingShadows.on('connect', function() {
      thingShadows.register( 'ChimeListener' , {} , function() {
        const chimeListenerState = {"state":{"desired":{"status": true}}};
        clientTokenUpdate = thingShadows.update('ChimeListener', chimeListenerState  );
        if (clientTokenUpdate === null)
        {
          console.log('update shadow failed, operation still in progress');
        }
    });
      });

    thingShadows.on('status', 
    function(thingName, stat, clientToken, stateObject) {
       console.log('received '+stat+' on '+thingName+': '+
                   JSON.stringify(stateObject));
    });

    thingShadows.on('delta', 
    function(thingName, stateObject) {
       console.log('received delta on '+thingName+': '+
                   JSON.stringify(stateObject));
    });

    thingShadows.on('timeout',
    function(thingName, clientToken) {
       console.log('received timeout on '+thingName+
                   ' with token: '+ clientToken);

    });
  }
  
    
    catch (err) {
    console.log(err);
    } 
  };

  return (
    <DeviceContext.Provider value={{
      device,
      initDevice,
      disconnectDevice,
      publishMessage,
      thingShadow,
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
