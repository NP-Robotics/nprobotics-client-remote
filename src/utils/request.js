import request from 'umi-request';

const makeRequest = (url, options) => {
  const requestUrl = `https://sheltered-meadow-88333.herokuapp.com/${url}`;
  try {
    const response = request(requestUrl, options);
    return response;
  } catch (err) {
    return err;
  }
};

export default makeRequest;
