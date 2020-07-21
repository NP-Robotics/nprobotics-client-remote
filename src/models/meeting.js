import { joinMeeting, endMeeting } from '../services/chimeAPI';
import {
  initMeeting,
  setupAudioVideo,
  setupObservers,
  bindVideoElement,
  bindAudioElement,
  startMeetingSession,
} from '../services/chimeSession';

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
    * join({ payload, callback, error }, { call, put, select }) {
      const {
        username, meetingName, region, jwtToken, audioRef, videoRef,
      } = payload;
      try {
        const response = yield call(joinMeeting, username, meetingName, region, jwtToken);
        const { Meeting, Attendee } = response.JoinInfo;
        console.log(audioRef);
        yield initMeeting(Meeting, Attendee);
        bindAudioElement(audioRef);
        bindVideoElement(videoRef);
        startMeetingSession();

        if (callback) {
          callback();
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

  },

  reducers: {
    setState(state, { payload }) {
      const newState = { ...state, ...payload };
      return newState;
    },
  },

};
