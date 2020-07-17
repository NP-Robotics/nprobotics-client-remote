import { joinMeeting, endMeeting } from '../services/chime'

export default {
namespace: 'meeting',

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
  *join({ payload, callback, error }, { call, put }) {
      const { name } = payload;
      const { title } = payload;
      const { region } = payload;
      try {
        const usr = yield joinMeeting(name, title, region);
        callback(usr);
      } catch (err) {
        error(err);
      }
    },

  *end({ payload, callback, error }, { call, put }) {
    const { meetingId } = payload;
    try {
      const usr = yield endMeeting(meetingId);
      callback(usr);
    } catch (err) {
      error(err);
    }
 
  },

},

reducers: {

},
};
