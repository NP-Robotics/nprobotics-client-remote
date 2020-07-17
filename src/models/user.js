import {
  ampSignIn, ampSignUp, ampGetSession, ampGetCredentials,
} from '../services/amplify';

export default {

  namespace: 'user',

  state: {
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
      /* history.listen(({ pathname }) => {
        if (pathname === '/dashboard') {
        }
      }); */
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
          type: 'setState',
          payload: {
            jwtToken: usr.signInUserSession.accessToken.jwtToken,
            username: usr.username,
          },
        });
        callback(usr);
      } catch (err) {
        error(err);
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
          },
        });
        console.log('cognito data', data);
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
      } catch (err) {
        console.log(err.message);
      }
    },
  },

  reducers: {
    setState(state, action) {
      const newState = { ...state, ...action.payload };
      console.log(newState);
      return newState;
    },
  },
};
