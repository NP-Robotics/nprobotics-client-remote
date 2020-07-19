import {
  ampSignIn, ampSignUp, ampGetSession, ampGetCredentials, ampGetAuthenticated, ampSignOut,
} from '../services/amplify';

const authenticatedRoutes = new Set([
  '/robot', '/dashboard',
]);

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
  },

  subscriptions: {

    setup({ dispatch, history }) {  // eslint-disable-line
      dispatch({
        type: 'getSession',
      });
      history.listen(({ pathname }) => {
        if (authenticatedRoutes.has(pathname)) {
          dispatch({
            type: 'getAuthenticated',
            callback: () => {
              dispatch({
                type: 'getCredentials',
              });
            },
            error: () => {
              history.push('/');
            },
          });
        }
      });
    },
  },

  effects: {
    *fetch({ payload }, { call, put }) {  // eslint-disable-line
      yield put({ type: 'setState' });
    },

    * signIn({ payload, callback, error }, { call, put }) {
      const { username } = payload;
      const { password } = payload;
      try {
        const usr = yield ampSignIn(username, password);
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
      const { username } = payload;
      const { password } = payload;
      const { email } = payload;
      const { name } = payload;
      try {
        const usr = yield ampSignUp(username, password, email, name);

        callback(usr);
      } catch (err) {
        error(err);
      }
    },
    * getSession({ payload, callback, error }, { call, put }) {
      try {
        const data = yield ampGetSession();
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
        console.log('identity data', cred);
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
      };
      return newState;
    },

  },
};
