import { joinMeeting, endMeeting } from '../services/chimeAPI';
import {
  ampSignIn,
  ampSignUp,
  ampGetSession,
  ampGetCredentials,
  ampGetAuthenticated,
  apmForgotPassword,
  apmForgotPasswordSubmit,
  ampSignOut,
} from '../services/amplify';

import { queryData } from '../services/dynamo';

const unauthenticatedRoutes = new Set(['/', '/login', '/signup', '/resetpassword', '/forgotpassword']);

export default {
  namespace: 'user',

  state: {
    authenticated: null,
    jwtToken: null,
    sessionToken: null,
    accessKeyId: null,
    secretAccessKey: null,
    identityId: null,
    username: null,
    organisation: null,
    robots: [],
    robotsLoaded: false,
    identityLoaded: false,
  },

  subscriptions: {
    setup({ dispatch, history, user }) {
      // eslint-disable-line
      // gets session information of user if user is logged in.
      dispatch({ type: 'getSession' });

      // route access control works here
      history.listen(({ pathname }) => {
        // getAuthenticated throws an error if user is not authenticated
        // This method should be called after the Auth module is configured or the user is logged in
        dispatch({
          type: 'getAuthenticated',
          error: () => {
            if (!unauthenticatedRoutes.has(pathname)) {
              history.push('/');
            }
          },
        });
      });
    },
  },

  effects: {
    * fetch({ payload }, { call, put }) {
      // eslint-disable-line
      yield put({ type: 'setState' });
    },

    * signIn({ payload, callback, error }, { call, put }) {
      const { username, password } = payload;
      try {
        const usr = yield call(ampSignIn, username, password);
        yield put({
          type: 'getSession',
        });
        callback(usr);
      } catch (err) {
        error(err);
      }
    },
    * signOut({ payload, callback, error }, { call, put }) {
      try {
        const usr = yield call(ampSignOut);
        yield put({
          type: 'clearAuthentication',
        });
        if (callback) {
          callback(usr);
        }
      } catch (err) {
        if (error) {
          error(err);
        }
      }
    },
    * signUp({ payload, callback, error }, { call, put }) {
      const {
        username,
        password,
        email,
        name,
        organisation,
      } = payload;

      try {
        const usr = yield call(ampSignUp, username, password, email, name, organisation);
        callback(usr);
      } catch (err) {
        error(err);
      }
    },
    * getSession({ payload, callback, error }, { call, put }) {
      try {
        const data = yield ampGetSession();
        const cred = yield ampGetCredentials();

        yield put({
          type: 'setState',
          payload: {
            jwtToken: data.accessToken.jwtToken,
            clientId: data.accessToken.payload.client_id,
            username: data.accessToken.payload.username,
            sessionToken: cred.sessionToken,
            accessKeyId: cred.accessKeyId,
            secretAccessKey: cred.secretAccessKey,
            identityId: cred.identityId,
            identityLoaded: true,
            authenticated: true,
          },
        });
        if (callback) {
          callback(data);
        }
      } catch (err) {
        if (error) {
          error(err);
        }
        yield put({
          type: 'setState',
          payload: {
            authenticated: false,
          },
        });
      }
    },
    * getCredentials({ payload, callback, error }, { call, put }) {
      try {
        const cred = yield ampGetCredentials();

        yield put({
          type: 'setState',
          payload: {
            sessionToken: cred.sessionToken,
            accessKeyId: cred.accessKeyId,
            secretAccessKey: cred.secretAccessKey,
            identityId: cred.identityId,
            identityLoaded: true,
          },
        });
        if (callback) {
          callback(cred);
        }
      } catch (err) {
        if (error) {
          error(err);
          yield put({
            type: 'setState',
            payload: {
              authenticated: false,
            },
          });
        }
      }
    },
    * getAuthenticated({ callback, error }, { call, put }) {
      try {
        const user = yield ampGetAuthenticated();

        yield put({
          type: 'getRobots',
          payload: {
            jwtToken: user.signInUserSession.accessToken.jwtToken,
            organisation: user.attributes['custom:organisation'],
          },
        });

        yield put({
          type: 'setState',
          payload: {
            organisation: user.attributes['custom:organisation'],
          },
        });

        if (callback) {
          callback(user);
        }
      } catch (err) {
        if (error) {
          error(err);
          yield put({
            type: 'setState',
            payload: {
              authenticated: false,
            },
          });
        }
      }
    },
    * forgotPassword({ payload, callback, error }, { call, put }) {
      const { username } = payload;
      try {
        const usr = yield apmForgotPassword(username);
        callback(usr);
      } catch (err) {
        error(err);
      }
    },
    * forgotPasswordSubmit({ payload, callback, error }, { call, put }) {
      const { username } = payload;
      const { code } = payload;
      const { newPassword } = payload;
      try {
        const usr = yield apmForgotPasswordSubmit(username, code, newPassword);
        callback(usr);
      } catch (err) {
        error(err);
      }
    },

    * getRobots({ payload, callback, error }, { call, put }) {
      const { organisation, jwtToken } = payload;

      try {
        let response = yield call(queryData, organisation, jwtToken);

        // because we store topics of robot in DB in JSON format,
        // we got to parse it into JS object
        response = response.map((item) => {
          if (item.rosConfig) {
            return ({
              ...item,
              rosConfig: JSON.parse(item.rosConfig),
            });
          }

          return item;
        });
        if (callback) {
          callback(response);
        }

        yield put({
          type: 'setState',
          payload: {
            robots: response,
            robotsLoaded: true,
          },
        });
      } catch (err) {
        console.log(err);
        if (error) {
          error(err);
        }
      }
    },

    * joinMeeting({ payload, callback, error }, { call, put }) {
      const {
        username, meetingName, region, jwtToken, isRobot,
      } = payload;

      try {
        const response = yield call(joinMeeting, username, meetingName, region, isRobot, jwtToken);
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
          yield callback(response.JoinInfo);
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
        yield call(endMeeting, meetingName, jwtToken);
        yield put({ type: 'clearMeeting' });
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
  },

  reducers: {
    setState(state, action) {
      const newState = { ...state, ...action.payload };
      return newState;
    },
    clearAuthentication(state, action) {
      const newState = {
        authenticated: false,
        jwtToken: null,
        sessionToken: null,
        accessKeyId: null,
        secretAccessKey: null,
        identityId: null,
        username: null,
        robots: [],
      };
      return newState;
    },
  },
};
