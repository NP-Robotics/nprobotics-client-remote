import { Auth } from 'aws-amplify';

export const signIn = async (username, password) => {
  try {
    console.log('username is ', username);
    const user = await Auth.signIn(username, password);
    return user;
  } catch (error) {
    console.log('error signing in', error);
    throw new Error(error);
  }
};

export const signOut = async () => {
  try {
    await Auth.signOut();
  } catch (error) {
    console.log('error signing out: ', error);
  }
};
