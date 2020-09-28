import { joinMeeting, endMeeting } from '../services/chimeAPI';
import {
  ampSignIn,
  ampSignUp,
  ampGetSession,
  ampGetCredentials,
  ampGetAuthenticated,
  apmForgotPassword,
  apmForgotPasswordSubmit,
  ampSignOut,
} from '../services/amplify';

import { queryData } from '../services/dynamo';
import { getImage, writeDesc, deleteImage } from '../services/S3';

const unauthenticatedRoutes = new Set(['/', '/login', '/signup', '/resetpassword', '/forgotpassword']);

export default {
  namespace: 'user',

  state: {
    authenticated: null,
    jwtToken: null,
    sessionToken: null,
    accessKeyId: null,
    secretAccessKey: null,
    identityId: null,
    username: null,
    organization: null,
    robots: [],
    robotsLoaded: false,
    images: [],
    imagesLoaded: false,
    identityLoaded: false,
  },

  subscriptions: {
    setup({ dispatch, history, user }) {
      // eslint-disable-line
      // gets session information of user if user is logged in.
      dispatch({ type: 'getSession' });

      // route access control works here
      history.listen(({ pathname }) => {
        // getAuthenticated throws an error if user is not authenticated
        // This method should be called after the Auth module is configured or the user is logged in
        dispatch({
          type: 'getAuthenticated',
          error: () => {
            if (!unauthenticatedRoutes.has(pathname)) {
              history.push('/');
            }
          },
        });
      });
    },
  },

  effects: {
    * fetch({ payload }, { call, put }) {
      // eslint-disable-line
      yield put({ type: 'setState' });
    },

    * signIn({ payload, callback, error }, { call, put }) {
      const { username, password } = payload;
      try {
        const usr = yield call(ampSignIn, username, password);
        yield put({
          type: 'getSession',
        });
        callback(usr);
      } catch (err) {
        error(err);
      }
    },
    * signOut({ payload, callback, error }, { call, put }) {
      try {
        const usr = yield call(ampSignOut);
        yield put({
          type: 'clearAuthentication',
        });
        if (callback) {
          callback(usr);
        }
      } catch (err) {
        if (error) {
          error(err);
        }
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
    * getSession({ payload, callback, error }, { call, put }) {
      try {
        const data = yield ampGetSession();
        const cred = yield ampGetCredentials();
        // getrobots first so loading screen will show before robots are gotten
        yield put({
          type: 'getRobots',
          payload: {
            jwtToken: data.accessToken.jwtToken,
            organisation: 'NP',
          },
        });
        /* yield put({
          type: 'getImages',
          payload: {
            jwtToken: data.accessToken.jwtToken,
            robotName: `coddie`,
          },
        }); */
        yield put({
          type: 'setState',
          payload: {
            jwtToken: data.accessToken.jwtToken,
            clientId: data.accessToken.payload.client_id,
            username: data.accessToken.payload.username,
            sessionToken: cred.sessionToken,
            accessKeyId: cred.accessKeyId,
            secretAccessKey: cred.secretAccessKey,
            identityId: cred.identityId,
            identityLoaded: true,
            authenticated: true,
          },
        });
        if (callback) {
          callback(data);
        }
      } catch (err) {
        if (error) {
          error(err);
        }
        yield put({
          type: 'setState',
          payload: {
            authenticated: false,
          },
        });
      }
    },
    * getCredentials({ payload, callback, error }, { call, put }) {
      try {
        const cred = yield ampGetCredentials();

        yield put({
          type: 'setState',
          payload: {
            sessionToken: cred.sessionToken,
            accessKeyId: cred.accessKeyId,
            secretAccessKey: cred.secretAccessKey,
            identityId: cred.identityId,
            identityLoaded: true,
          },
        });
        if (callback) {
          callback(cred);
        }
      } catch (err) {
        if (error) {
          error(err);
          yield put({
            type: 'setState',
            payload: {
              authenticated: false,
            },
          });
        }
      }
    },
    * getAuthenticated({ callback, error }, { call, put }) {
      try {
        const user = yield ampGetAuthenticated();

        if (callback) {
          callback(user);
        }
      } catch (err) {
        if (error) {
          error(err);
          yield put({
            type: 'setState',
            payload: {
              authenticated: false,
            },
          });
        }
      }
    },
    * forgotPassword({ payload, callback, error }, { call, put }) {
      const { username } = payload;
      try {
        const usr = yield apmForgotPassword(username);
        callback(usr);
      } catch (err) {
        error(err);
      }
    },
    * forgotPasswordSubmit({ payload, callback, error }, { call, put }) {
      const { username } = payload;
      const { code } = payload;
      const { newPassword } = payload;
      console.log('success', payload);
      try {
        const usr = yield apmForgotPasswordSubmit(username, code, newPassword);
        callback(usr);
      } catch (err) {
        error(err);
      }
    },

    * getRobots({ payload, callback, error }, { call, put }) {
      const { organisation, jwtToken } = payload;

      try {
        let response = yield call(queryData, organisation, jwtToken);

        // because we store topics of robot in DB in JSON format,
        // we got to parse it into JS object
        if (response[0].topics) {
          response = response.map((obj) => ({
            ...obj,
            topics: JSON.parse(obj.topics),
          }));
          console.log('response');
        }
        if (callback) {
          callback(response);
        }

        yield put({
          type: 'setState',
          payload: {
            robots: response,
            robotsLoaded: true,
          },
        });
      } catch (err) {
        console.log(err);
        if (error) {
          error(err);
        }
      }
    },

    * listImages({ payload, callback, error }, { call, put }) {
      const data = yield ampGetSession();
      const { robotName } = payload;
      try {
        yield put({
          type: 'getImages',
          payload: {
            jwtToken: data.accessToken.jwtToken,
            robotName: `${robotName}`, // case sensitive
          },
        });
      } catch (err) {
        error(err);
      }
    },

    * getImages({ payload, callback, error }, { call, put }) {
      const { robotName, jwtToken } = payload;
      let i = 0;
      let h;
      let ms;
      let day;
      let month;
      let year;

      try {
        let response = yield call(getImage, robotName, jwtToken);

        if (response) {
          response = response.map((obj) => ({
            ...obj,
          }));
          console.log(response);
          for (i = 0; i < response.length; i += 1) {
            ms = response[i].LastModified.slice(14, 16);
            h = response[i].LastModified.slice(11, 13);
            h = parseInt(h, 10) + 8;

            day = response[i].LastModified.slice(8, 10);
            month = response[i].LastModified.slice(6, 7);
            year = response[i].LastModified.slice(0, 4);

            if (h > 12) {
              h -= 12;
              response[i].LastModified = `${h}:${ms} pm`;
            } else {
              response[i].LastModified = `${h}:${ms}am`;
            }

            response[i].Date = `${day}/${month}/${year}`;

            if (response[i].Key.includes('facemaskviolation')) {
              response[i].desc = 'Face Mask Violation';
            } else if (response[i].Key.includes('safedistancingviolation')) {
              response[i].desc = 'Safe Distancing Violation';
            }
          }
        }
        if (callback) {
          callback(response);
        }

        yield put({
          type: 'setState',
          payload: {
            images: response,
            imagesLoaded: true,
          },
        });
      } catch (err) {
        console.log(err);
        if (error) {
          error(err);
        }
      }
    },

    * writeImgDesc({ payload, callback, error }, { call, put }) {
      const {
        fileName,
        file,
        jwtToken,
      } = payload;

      try {
        yield call(writeDesc, fileName, file, jwtToken);
      } catch (err) {
        error(err);
      }
    },

    * deleteImage({ payload, callback, error }, { call, put }) {
      const { key, jwtToken } = payload;

      try {
        yield call(deleteImage, key, jwtToken);
      } catch (err) {
        error(err);
      }
    },

    * joinMeeting({ payload, callback, error }, { call, put }) {
      const {
        username, meetingName, region, jwtToken, isRobot,
      } = payload;

      try {
        const response = yield call(joinMeeting, username, meetingName, region, isRobot, jwtToken);
        console.log(response);
        const { Meeting, Attendee } = response.JoinInfo;

        yield put({
          type: 'setState',
          payload: {
            meetingResponse: Meeting,
            attendeeResponse: Attendee,
            joined: true,
          },
        });

        if (callback) {
          yield callback(response.JoinInfo);
        }
      } catch (err) {
        console.log(err);
        if (error) {
          error(err);
        }
      }
    },
    * end({ payload, callback, error }, { call, put }) {
      const { meetingName, jwtToken } = payload;
      try {
        yield call(endMeeting, meetingName, jwtToken);
        yield put({ type: 'clearMeeting' });
        if (callback) {
          callback();
        }
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
    clearAuthentication(state, action) {
      const newState = {
        authenticated: false,
        jwtToken: null,
        sessionToken: null,
        accessKeyId: null,
        secretAccessKey: null,
        identityId: null,
        username: null,
        robots: [],
        images: [],
      };
      return newState;
    },
  },
};
