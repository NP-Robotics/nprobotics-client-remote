import {
  MeetingSessionConfiguration,
  ConsoleLogger,
  DefaultDeviceController,
  LogLevel,
  DefaultMeetingSession,
} from 'amazon-chime-sdk-js';
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
    * join({ payload, callback, error }, { call, put, select }) {
      const {
        username, meetingName, region, jwtToken,
      } = payload;
      try {
        const response = yield call(joinMeeting, username, meetingName, region, jwtToken);
        console.log(response);
        const { Attendee, Meeting } = response.JoinInfo;
        const configuration = new MeetingSessionConfiguration(Meeting, Attendee);

        const logger = new ConsoleLogger('MyLogger', LogLevel.INFO);
        const deviceController = new DefaultDeviceController(logger);

        const meetingSession = new DefaultMeetingSession(
          configuration,
          logger,
          deviceController,
        );
        console.log(meetingSession);
        yield put({
          type: 'setState',
          payload: {
            meetingSession,
          },
        });

        yield put({
          type: 'getAudioVideo',
        });

        if (callback) {
          callback(meetingSession);
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

    * getAudioVideo({ payload, callback, error }, { call, put, select }) {
      const { meetingSession } = yield select((state) => state.meeting);
      console.log('yeeeetet', meetingSession);
      const audioInput = yield meetingSession.audioVideo.listAudioInputDevices();
      const audioOutput = yield meetingSession.audioVideo.listAudioOutputDevices();
      const videoInput = yield meetingSession.audioVideo.listVideoInputDevices();
      console.log(audioInput);
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
    setState(state, { payload }) {
      const newState = { ...state, ...payload };
      console.log(newState);
      return newState;
    },
  },

};
