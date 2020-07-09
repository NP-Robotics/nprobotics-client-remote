export default {

  namespace: 'global',

  state: {
    text: 'text',
  },

  subscriptions: {
    setup({ dispatch, history }) {  // eslint-disable-line
      /* history.listen(({ pathname }) => {
        if (pathname === '/') {

        }
      }); */
    },
  },

  effects: {
    *fetch({ payload }, { call, put }) {  // eslint-disable-line
      yield put({ type: 'save' });
    },
  },

  reducers: {
    setState(state, action) {
      const newState = { ...state, ...action.payload };
      return newState;
    },
  },
};
