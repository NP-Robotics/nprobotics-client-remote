import makeRequest from '../utils/request';

const makeRDSRequest = (action, payload) => {
  const url = `https://zuk89u6l8k.execute-api.us-east-1.amazonaws.com/dev/${action}`;
  const response = makeRequest(url, payload);
  return response;
};

export const getImage = (variable, data, jwtToken) => {
  const action = 'getDBData';
  const response = makeRDSRequest(action, {
    method: 'get',
    headers: {
      Authorization: `Bearer ${jwtToken}`,
    },
    params: {
      variable,
      data,
    },
    skipErrorHandler: true,
  });
  return response;
};

export const writeDesc = (imageLink, addDescription, jwtToken) => {
  const action = 'updateAddDesc';
  const response = makeRDSRequest(action, {
    method: 'put',
    headers: {
      Authorization: `Bearer ${jwtToken}`,
    },
    params: {
      imageLink,
      addDescription,
    },
    skipErrorHandler: true,
  });
  return response;
};

export const deleteImage = (imageID, jwtToken) => {
  const action = 'deleteDBData';
  const response = makeRDSRequest(action, {
    method: 'delete',
    headers: {
      Authorization: `Bearer ${jwtToken}`,
    },
    params: {
      imageID,
    },
    skipErrorHandler: true,
  });
  return response;
};

export const deleteImageByLink = (imageLink, jwtToken) => {
  const action = 'deleteImageByLink';
  const response = makeRDSRequest(action, {
    method: 'delete',
    headers: {
      Authorization: `Bearer ${jwtToken}`,
    },
    params: {
      imageLink,
    },
    skipErrorHandler: true,
  });
  return response;
};

export const getAddDesc = (imageLink, jwtToken) => {
  const action = 'getAddDesc';
  const response = makeRDSRequest(action, {
    method: 'get',
    headers: {
      Authorization: `Bearer ${jwtToken}`,
    },
    params: {
      imageLink,
    },
    skipErrorHandler: true,
  });
  return response;
};

export const queryDBData = (jwtToken) => {
  const action = 'queryDBData';
  const response = makeRDSRequest(action, {
    method: 'get',
    headers: {
      Authorization: `Bearer ${jwtToken}`,
    },
    skipErrorHandler: true,
  });
  return response;
};

export const searchBar = (searchData, jwtToken) => {
  const action = 'searchBar';
  const response = makeRDSRequest(action, {
    method: 'get',
    headers: {
      Authorization: `Bearer ${jwtToken}`,
    },
    params: {
      searchData,
    },
    skipErrorHandler: true,
  });
  return response;
};

export const deleteDBData = (imageID, jwtToken) => {
  const action = 'deleteDBData';
  const response = makeRDSRequest(action, {
    method: 'delete',
    headers: {
      Authorization: `Bearer ${jwtToken}`,
    },
    params: {
      imageID,
    },
    skipErrorHandler: true,
  });
  return response;
};
