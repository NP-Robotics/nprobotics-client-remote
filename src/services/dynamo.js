/* eslint-disable import/prefer-default-export */
import makeRequest from '../utils/request';
// queryData = one parameter, getData = one specific robot
// params = RobotID, MeetingRoom, organisation, endpoint, robotName

const makeDynamoRequest = (payload) => {
  const url = 'https://zuk89u6l8k.execute-api.us-east-1.amazonaws.com/dev/queryData';
  const response = makeRequest(url, payload);
  return response;
};

// `queryData?organisation=${org}`
export const queryData = (organisation, jwtToken) => {
  const response = makeDynamoRequest({
    method: 'get',
    headers: {
      Authorization: `Bearer ${jwtToken}`,
    },
    params: {
      organisation,
    },
    skipErrorHandler: true,
  });
  return response;
};

/*
export const getData = (RobotID, jwtToken) => {
    const action = `getData?RobotID=${id}`
    const id =  ;
    const response = makeDynamoRequest(action, {
      method: 'get',
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
      params: {
        organisation,
      },
      skipErrorHandler: true,
    });
    return response;
  };
*/
