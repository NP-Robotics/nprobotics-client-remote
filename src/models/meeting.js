import { joinMeeting, endMeeting } from '../services/chimeAPI';

export default {
  namespace: 'meeting',

  state: {
    meetingResponse: null,
    attendeeResponse: null,
    joined: false,
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
        const { Meeting, Attendee } = response.JoinInfo;

        yield put({
          type: 'setState',
          payload: {
            meetingResponse: Meeting,
            attendeeResponse: Attendee,
            joined: true,
          },
        });

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

        yield put({ type: 'clearMeeting' });
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
    clearMeeting(state) {
      const newState = {
        ...state,
        meetingResponse: null,
        attendeeResponse: null,
        joined: false,
      };
      return newState;
    },
  },

};
