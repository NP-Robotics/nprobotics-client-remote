import makeRequest from '../utils/request';

const makeChimeRequest = (action, payload) => {
  const url = `2tqfe67uy9.execute-api.us-east-1.amazonaws.com/dev/${action}`;
  const response = makeRequest(url, payload);
  return response;
};

export const joinMeeting = (username, meetingName, region, isRobot, jwtToken) => {
  const action = 'joinMeeting';
  const response = makeChimeRequest(action, {
    method: 'post',
    headers: {
      Authorization: `Bearer ${jwtToken}`,
    },
    params: {
      username,
      meetingName,
      region,
      isRobot,
    },
    skipErrorHandler: true,
  });
  return response;
};

export const endMeeting = (meetingName, jwtToken) => {
  const action = 'endMeeting';
  const response = makeChimeRequest(action, {
    method: 'post',
    headers: {
      Authorization: `Bearer ${jwtToken}`,
    },
    params: {
      meetingName,
    },
    skipErrorHandler: true,
  });
  return response;
};
