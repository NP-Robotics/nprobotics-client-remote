import Search from 'antd/lib/input/Search';
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
import {
  getImage, writeDesc, deleteImage, deleteImageByLink,
  getAddDesc, queryDBData, searchBar, deleteDBData,
} from '../services/RDS';

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
    imagesID: [],
    imagesIDLoaded: false,
    identityLoaded: false,
    addDesc: [],
    addDescLoaded: false,
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
      const sess = yield ampGetSession();
      const { variable, data } = payload;
      try {
        yield put({
          type: 'getImages',
          payload: {
            jwtToken: sess.accessToken.jwtToken,
            variable: `${variable}`,
            data: `${data}`,
          },
        });
      } catch (err) {
        error(err);
      }
    },

    * getImages({ payload, callback, error }, { call, put }) {
      const { variable, data, jwtToken } = payload;
      let i = 0;
      let h;
      let ms;
      let day;
      let month;
      let year;
      try {
        let response = yield call(getImage, variable, data, jwtToken);

        if (response) {
          response = response.map((obj) => ({
            ...obj,
          }));
          console.log(response);
          for (i = 0; i < response.length; i += 1) {
            ms = response[i].time.slice(3, 5);
            h = response[i].time.slice(0, 2);

            day = response[i].date.slice(8, 10);
            month = response[i].date.slice(5, 7);
            year = response[i].date.slice(0, 4);

            if (h > 12) {
              h -= 12;
              response[i].time = `${h}:${ms} pm`;
            } else if (h === 12) {
              response[i].time = `${h}:${ms} pm`;
            } else {
              response[i].time = `${h}:${ms} am`;
            }

            response[i].date = `${day}/${month}/${year}`;
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

    * getAddDesc({ payload, callback, error }, { call, put }) {
      const { imageLink, jwtToken } = payload;
      try {
        let response = yield call(getAddDesc, imageLink, jwtToken);

        if (response) {
          response = response.map((obj) => ({
            ...obj,
          }));
          console.log(response);
        }
        if (callback) {
          callback(response);
        }

        yield put({
          type: 'setState',
          payload: {
            addDesc: response,
            addDescLoaded: true,
          },
        });
      } catch (err) {
        error(err);
      }
    },

    * searchBar({ payload, callback, error }, { call, put }) {
      const { searchData, jwtToken } = payload;
      let x = 0;
      let i = 0;
      let h;
      let ms;
      let day;
      let month;
      let year;
      let violationArray = [];
      let search = searchData;
      try {
        if (searchData.includes('pm')) {
          h = searchData.slice(0, 2);
          if (h !== 12) {
            h = parseInt(h, 10) + 12;
          }
          ms = searchData.slice(3, 5);
          search = `${h}:${ms}:00`;
        } else if (searchData.includes('am')) {
          h = searchData.slice(0, 2);
          ms = searchData.slice(3, 5);
          search = `${h}:${ms}:00`;
        } else if (/\d/.test(searchData)) {
          day = searchData.slice(0, 2);
          month = searchData.slice(3, 5);
          year = searchData.slice(6, 10);
          search = `${year}-${month}-${day}`;
        } else if (searchData.toLowerCase().includes('violation')) {
          violationArray = searchData.toLowerCase().split(' ');
          console.log(violationArray);
          for (x = 0; x <= searchData.split.length; x += 1) {
            violationArray[x] = violationArray[x].charAt(0).toUpperCase()
            + violationArray[x].substring(1);
          }
          search = violationArray.join(' ');
        }
        let response = yield call(searchBar, search, jwtToken);

        if (response) {
          response = response.map((obj) => ({
            ...obj,
          }));
          console.log(response);
          for (i = 0; i < response.length; i += 1) {
            ms = response[i].time.slice(3, 5);
            h = response[i].time.slice(0, 2);

            day = response[i].date.slice(8, 10);
            month = response[i].date.slice(5, 7);
            year = response[i].date.slice(0, 4);

            if (h > 12) {
              h -= 12;
              response[i].time = `${h}:${ms} pm`;
            } else if (h === 12) {
              response[i].time = `${h}:${ms} pm`;
            } else {
              response[i].time = `${h}:${ms} am`;
            }

            response[i].date = `${day}/${month}/${year}`;
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
        error(err);
      }
    },

    * writeImgDesc({ payload, callback, error }, { call, put }) {
      const {
        imageLink,
        addDescription,
        jwtToken,
      } = payload;
      try {
        yield call(writeDesc, imageLink, addDescription, jwtToken);
        window.location.reload();
      } catch (err) {
        error(err);
      }
    },

    * deleteImageByLink({ payload, callback, error }, { call, put }) {
      const { imageLink, jwtToken } = payload;
      try {
        yield call(deleteImageByLink, imageLink, jwtToken);
        window.location.reload();
      } catch (err) {
        error(err);
      }
    },

    * deleteDBData({ payload, callback, error }, { call, put }) {
      const { imageID, jwtToken } = payload;
      try {
        yield call(deleteDBData, imageID, jwtToken);
        window.location.reload();
      } catch (err) {
        error(err);
      }
    },

    * joinMeeting({ payload, callback, error }, { call, put }) {
      const {
        username, meetingName, region, jwtToken,
      } = payload;

      try {
        const response = yield call(joinMeeting, username, meetingName, region, jwtToken);
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
      try {
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
