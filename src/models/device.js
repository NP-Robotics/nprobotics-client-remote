import awsIot from 'aws-iot-device-sdk';

export default {

  namespace: 'device',

  state: {
    device: null,
  },

  subscriptions: {
    /* setup({ dispatch, history }) {  // eslint-disable-line
      history.listen(({ pathname }) => {
        if (pathname === '/dashboard') {
        }
      });
    }, */
  },

  effects: {
    *fetch({ payload }, { call, put }) {  // eslint-disable-line
      yield put({ type: 'setState' });
    },
  },

  reducers: {
    initDevice(state, { payload, callback, error }) {
      console.log(payload);
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
        const newState = { ...state, device: _device };
        return newState;
      } catch (err) {
        error(err);
        return state;
      }
    },
    publishCmdVel(state, { payload }) {
      const { device } = state;
      const twistMsg = {
        linear: {
          x: payload.vel,
          y: 0,
          z: 0,
        },
        angular: {
          x: 0,
          y: 0,
          z: payload.angle,
        },
      };
      if (device) {
        try {
          device.publish('/cmd_vel', JSON.stringify(twistMsg));
        } catch (err) {
          console.log(err);
        }
      }

      return state;
    },
    publishVoiceMessage(state, { payload }) {
      const { device } = state;
      const voiceMsg = {
        message: payload.data,
      };
      if (device) {
        try {
          device.publish('/voice_message', JSON.stringify(voiceMsg));
        } catch (err) {
          console.log(err);
        }
      }

      return state;
    },
  },
};
