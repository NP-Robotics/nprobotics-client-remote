import { ampSignIn, ampSignUp } from '../services/amplify';

export default {

  namespace: 'user',

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
    *fetch({ payload }, { call, put }) {  // eslint-disable-line
      yield put({ type: 'setState' });
    },

    * signIn({ payload, callback, error }, { call, put }) {
      const { username, password } = payload;
      try {
        const usr = yield call(ampSignIn, username, password);
        callback(usr);
      } catch (err) {
        error(err);
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
  },

  reducers: {
    setState(state, action) {
      const newState = { ...state, ...action.payload };
      return newState;
    },
  },
};
