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
              x: 6.43220822289,
              y: 4.13017857761,
              z: 0.0,
            },
            orientation: {
              x: 0.0,
              y: 0.0,
              z: -0.958923310547,
              w: 0.283665444651,
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
              x: 2.50322243559,
              y: 2.39157362805,
              z: 0.0,
            },
            orientation: {
              x: 0.0,
              y: 0.0,
              z: 0.536790828756,
              w: 0.843715358497,
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
              x: 5.19174225103,
              y: 5.28236000585,
              z: 0.0,
            },
            orientation: {
              x: 0.0,
              y: 0.0,
              z: -0.814106932353,
              w: 0.580714992655,
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
