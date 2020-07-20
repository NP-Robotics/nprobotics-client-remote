import { queryData } from '../services/dynamo';

export default {
  namespace: 'updateData',

  state: {
    authKey: null,
  },

  subscriptions: {},

  effects: {
    * NP({ payload, callback, error }, { call, put }) {
      const { organisation, jwtToken } = payload;
      try {
        const response = yield call(organisation, jwtToken);
        console.log(response);
        if (callback) {
          callback(response);
        }
      } catch (err) {
        console.log(err);
        if (error) {
          error(err);
        }
      }
    },
  },

  reducers: {},
};
