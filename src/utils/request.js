import request from 'umi-request';

const makeRequest = (url, options) => {
  const requestUrl = `https://cors-anywhere.herokuapp.com/${url}`;
  try {
    const response = request(requestUrl, options);
    return response;
  } catch (err) {
    return err;
  }
};

export default makeRequest;
