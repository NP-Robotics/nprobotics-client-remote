import makeRequest from '../utils/request';

const makeS3Request = (action, payload) => {
  const url = `https://zuk89u6l8k.execute-api.us-east-1.amazonaws.com/dev/${action}`;
  const response = makeRequest(url, payload);
  return response;
};

// `get-image?robotName=${robotName}`
export const getImage = (robotName, jwtToken) => {
  const action = 'get-image';
  const response = makeS3Request(action, {
    method: 'get',
    headers: {
      Authorization: `Bearer ${jwtToken}`,
    },
    params: {
      robotName,
    },
    skipErrorHandler: true,
  });
  return response;
};

export const writeDesc = (fileName, file, jwtToken) => {
  const action = 'upload-desc';
  const response = makeS3Request(action, {
    method: 'post',
    headers: {
      Authorization: `Bearer ${jwtToken}`,
    },
    params: {
      fileName,
    },
    body: {
      file,
    },
    skipErrorHandler: true,
  });
  return response;
};

export const deleteImage = (key, jwtToken) => {
  const action = 'delete-image';
  const response = makeS3Request(action, {
    method: 'delete',
    headers: {
      Authorization: `Bearer ${jwtToken}`,
    },
    params: {
      key,
    },
    skipErrorHandler: true,
  });
  return response;
};
