import { signIn } from '../services/amplify';

export default {

  namespace: 'global',

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

    * signIn({ payload, callback }, { call, put }) {
      const { username } = payload;
      const { password } = payload;
      try {
        const usr = yield signIn(username, password);
        console.log(usr);
      } catch (err) {
        callback(err);
      }
    },
  },

  reducers: {
    setState(state, action) {
      const newState = { state, ...action.payload };
      return newState;
    },
  },
};
