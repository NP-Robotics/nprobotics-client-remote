import { joinMeeting, endMeeting } from '../services/chime';

export default {
  namespace: 'meeting',

  state: {
    authKey: null,
    meetingSession: null,
    audioInput: null,
    audioOutput: null,
    videoInput: null,
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
    * join({ payload, callback, error }, { call, put }) {
      const {
        username, meetingName, region, jwtToken,
      } = payload;
      try {
        const response = yield call(joinMeeting, username, meetingName, region, jwtToken);
        console.log(response);
        if (callback) {
          callback(response);
        }
      } catch (err) {
        console.log(err);
        if (error) {
          error(err);
        }
      }
    },

    * end({ payload, callback, error }, { call, put }) {
      const { meetingName, jwtToken } = payload;
      try {
        const response = yield call(endMeeting, meetingName, jwtToken);
        console.log(response);
        if (callback) {
          callback(response);
        }
      } catch (err) {
        console.log(err);
        if (error) {
          error(err);
        }
      }
    },

    * audioVideo({ payload, callback, error }, { call, put, select }) {
      const meetingSession = yield select((state) => state.meetingSession);
      const audioInput = yield call(meetingSession.audioVideo.listAudioInputDevices);
      const audioOutput = yield call(meetingSession.audioVideo.listAudioOutputDevices);
      const videoInput = yield call(meetingSession.audioVideo.listVideoInputDevices);
      console.log(meetingSession);
      yield put({
        type: 'setState',
        payload: {
          audioInput,
          audioOutput,
          videoInput,
        },
      });
    },
  },

  reducers: {
    setState(state, action) {
      const newState = { ...state, ...action.payload };
      return newState;
    },
  },
};
