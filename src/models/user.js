import { ampSignIn, ampSignUp, ampGetSession } from '../services/amplify';

export default {

  namespace: 'user',

  state: {
    sessionToken: null,
  },

  subscriptions: {

    setup({ dispatch, history }) {  // eslint-disable-line
      dispatch({
        type: 'getSessionToken',
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
          type: 'setSessionToken',
          payload: {
            sessionToken: usr.Session,
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
    * getSessionToken({ payload, callback, error }, { call, put }) {
      try {
        const data = yield ampGetSession();
        yield put({
          type: 'setSessionToken',
          payload: {
            sessionToken: data.accessToken.jwtToken,
          },
        });
        console.log('Received session token');
      } catch (err) {
        console.log(err.message);
      }
    },
  },

  reducers: {
    setState(state, action) {
      const newState = { ...state, ...action.payload };
      return newState;
    },
    setSessionToken(state, { payload: sessionToken }) {
      return { ...state, ...sessionToken };
    },
  },
};
