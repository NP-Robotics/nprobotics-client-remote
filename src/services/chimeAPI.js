import makeRequest from '../utils/request';

const makeChimeRequest = (action, payload) => {
  const url = `ve5bhz6ga3.execute-api.us-east-1.amazonaws.com/Prod/${action}`;
  const response = makeRequest(url, payload);
  return response;
};

export const joinMeeting = (name, title, region, jwtToken) => {
  const action = 'join';
  const response = makeChimeRequest(action, {
    method: 'post',
    headers: {
      Authorization: `Bearer ${jwtToken}`,
    },
    params: {
      name,
      title,
      region,
    },
    skipErrorHandler: true,
  });
  return response;
};

export const endMeeting = (meetingName, jwtToken) => {
  const action = 'end';
  const response = makeChimeRequest(action, {
    method: 'post',
    headers: {
      Authorization: `Bearer ${jwtToken}`,
    },
    params: {
      title: meetingName,
    },
    skipErrorHandler: true,
  });
  return response;
};
