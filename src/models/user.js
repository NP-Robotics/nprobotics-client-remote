import { ampSignIn, ampSignUp } from '../services/amplify';

export default {

  namespace: 'user',

  state: {
    sessionToken: null,
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
    *fetch({ payload }, { call, put }) {  // eslint-disable-line
      yield put({ type: 'setState' });
    },

    * signIn({ payload, callback, error }, { call, put }) {
      const { username } = payload;
      const { password } = payload;
      try {
        const usr = yield ampSignIn(username, password);
        callback(usr);

        yield put({
          type: 'setState',
          payload: {
            sessionToken: usr.Session,
          },
        });
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
  },

  reducers: {
    setState(state, action) {
      const newState = { ...state, ...action.payload };
      return newState;
    },
  },
};
