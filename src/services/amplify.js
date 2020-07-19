import Amplify, { Auth } from 'aws-amplify';
import config from '../config';

Amplify.configure({
  Auth: {
    mandatorySignIn: true,
    region: config.cognito.REGION,
    userPoolId: config.cognito.USER_POOL_ID,
    identityPoolId: config.cognito.IDENTITY_POOL_ID,
    userPoolWebClientId: config.cognito.APP_CLIENT_ID,
  },
});

export const ampSignIn = async (username, password) => {
  try {
    console.log('username is ', username);
    const user = await Auth.signIn(username, password);
    return user;
  } catch (error) {
    console.log('error signing in', error);
    throw error;
  }
};

export const ampSignOut = async () => {
  try {
    await Auth.signOut();
  } catch (error) {
    console.log('error signing out: ', error);
  }
};

export const ampSignUp = async (username, password, email, name) => {
  try {
    const user = await Auth.signUp({
      username,
      password,
      attributes: {
        email, // optional
        name,
        // other custom attributes
      },
    });
  } catch (error) {
    console.log('error signing up', error);
    throw error;
  }
};

export const ampGetSession = async () => {
  const data = Auth.currentSession();
  return data;
};

export const ampGetCredentials = async () => {
  const credentials = Auth.currentCredentials();
  return credentials;
};

export const ampGetAuthenticated = async () => {
  const user = Auth.currentAuthenticatedUser();
  return user;
};

export const apmForgotPassword = async (username) => {
  try {
    const user = await Auth.forgotPassword(username)
      .then((data) => console.log(data))
      .catch((err) => console.log(err));
    return user;
  } catch (error) {
    console.log('error sending verification code', error);
    throw error;
  }
};

export const apmForgotPasswordSubmit = async (username, code, newPassword) => {
  console.log('success', code);
  try {
    const user = Auth.forgotPasswordSubmit(username, code, newPassword)
      .then((data) => console.log(data))
      .catch((err) => console.log(err));
    return user;
  } catch (error) {
    console.log('error resetting password', error);
    throw error;
  }
};
