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
  },

  reducers: {
    setState(state, { payload }) {
      const newState = { ...state, ...payload };
      return newState;
    },
  },

};
