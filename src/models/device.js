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
    disconnectDevice(state) {
      const { device } = state;
      device.end();
      return state;
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
        data: payload.data,
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
    publishEmote(state, { payload }) {
      const { device } = state;
      const emoteMsg = {
        data: payload.emote,
      };
      if (device) {
        try {
          device.publish('/emote_topic', JSON.stringify(emoteMsg));
        } catch (err) {
          console.log(err);
        }
      }

      return state;
    },

    publishNavigate(state, { payload }) {
      const { device } = state;

      let navigateMsg = null;

      if (payload.location === 1) {
        navigateMsg = {
          header: {
            seq: 2,
            stamp: {
              secs: 0,
              nsecs: 0,
            },
            frame_id: 'map',
          },
          pose: {
            position: {
              x: -1.647,
              y: -0.049,
              z: 0.0,
            },
            orientation: {
              x: 0.0,
              y: 0.0,
              z: 0.811,
              w: -0.585,
            },
          },
        };
      } else if (payload.location === 2) {
        navigateMsg = {
          header: {
            seq: 1,
            stamp: {
              secs: 0,
              nsecs: 0,
            },
            frame_id: 'map',
          },
          pose: {
            position: {
              x: 0.656,
              y: -4.677,
              z: 0.0,
            },
            orientation: {
              x: 0.0,
              y: 0.0,
              z: -0.165,
              w: 0.986,
            },
          },
        };
      } else if (payload.location === 3) {
        navigateMsg = {
          header: {
            seq: 3,
            stamp: {
              secs: 0,
              nsecs: 0,
            },
            frame_id: 'map',
          },
          pose: {
            position: {
              x: -0.758,
              y: -5.620,
              z: 0.0,
            },
            orientation: {
              x: 0.0,
              y: 0.0,
              z: 0.572,
              w: 0.820,
            },
          },
        };
      }
      if (device) {
        try {
          device.publish('/move_base_simple/goal', JSON.stringify(navigateMsg));
        } catch (err) {
          console.log(err);
        }
      }
      return state;
    },
  },
};
