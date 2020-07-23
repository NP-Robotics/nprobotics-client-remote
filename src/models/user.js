import {
  ampSignIn,
  ampSignUp,
  ampGetSession,
  ampGetCredentials,
  ampGetAuthenticated,
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
    organization: null,
    robots: [],
  },

  subscriptions: {
    setup({ dispatch, history, user }) {
      // eslint-disable-line
      dispatch({ type: 'getSession' });

      history.listen(({ pathname }) => {
        dispatch({
          type: 'getAuthenticated',
          callback: () => {
            dispatch({ type: 'getCredentials' });
          },
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
      } = payload;

      try {
        const usr = yield call(ampSignUp, username, password, email, name);
        callback(usr);
      } catch (err) {
        error(err);
      }
    },
    * getSession({ payload, callback, error }, { call, put }) {
      try {
        const data = yield ampGetSession();
        // getrobots first so loading screen will show before robots are gotten
        yield put({
          type: 'getRobots',
          payload: {
            jwtToken: data.accessToken.jwtToken,
            organisation: 'NP',
          },
        });
        yield put({
          type: 'setState',
          payload: {
            jwtToken: data.accessToken.jwtToken,
            clientId: data.accessToken.payload.client_id,
            username: data.accessToken.payload.username,
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
        console.log(user);

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
    * getRobots({ payload, callback, error }, { call, put }) {
      const { organisation, jwtToken } = payload;
      try {
        const response = yield call(queryData, organisation, jwtToken);
        if (callback) {
          callback(response);
        }

        yield put({
          type: 'setState',
          payload: {
            robots: response,
          },
        });
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
