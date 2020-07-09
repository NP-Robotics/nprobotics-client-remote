import { signIn } from '../services/amplify';

export default {

  namespace: 'global',

  state: {
    authKey: null,
    name: 'sdfdsf',
    id: '32324324',
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
        callback(usr);
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
