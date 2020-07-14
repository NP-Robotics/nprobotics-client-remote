import makeRequest from '../utils/request';

export const joinMeeting = (name1, title1) => {
  const { returnVal } = makeRequest('', {
    params: {
      name: name1,
      title: title1,
      region: 'us-east-1',
    },
    skipErrorHandler: true,
  });
  return returnVal;
};

export const endMeeting = (name1, title1) => {
  const { returnVal } = makeRequest('', {
    params: {
      name: name1,
      title: title1,
      region: 'us-east-1',
    },
    skipErrorHandler: true,
  });
  return returnVal;
};
