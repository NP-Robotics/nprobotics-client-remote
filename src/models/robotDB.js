import { queryData } from '../services/dynamo';

export default {
  namespace: 'robotDB',

  state: {
    robotInfo: {},
  },

  subscriptions: {},

  effects: {
    * getRobotInfo({ payload, callback, error }, { call, put }) {
      const { organisation, jwtToken } = payload;
      try {
        const response = yield call(queryData, organisation, jwtToken);
        console.log(response);
        if (callback) {
          callback(response);
        }

        yield put({
          type: 'setState',
          payload: {
            robotInfo: response,
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
  },
};
