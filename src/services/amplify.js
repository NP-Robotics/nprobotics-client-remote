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
    console.log({ user });
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
