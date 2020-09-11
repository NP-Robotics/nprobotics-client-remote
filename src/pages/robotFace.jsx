import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

import { connect } from 'dva';
import { Button, message } from 'antd';
import { Joystick } from 'react-joystick-component';

import ChimeVideoStream from '../components/ChimeVideoStream';

import Face from '../assets/face.jpg';
import style from './robotFace.css';

const RobotFace = ({
  user, meeting, dispatch, history,
}) => {
  const [state, setState] = useState({
    endpoint: 'a17t8rhn8oueg6-ats.iot.us-east-1.amazonaws.com',
    inUse: false,
    meetingName: 'meetingaaa',
    online: false,
    organisation: 'NP',
    robotID: '222',
    robotName: 'Coddie',
  });

  // join meeting if all parameters are present
  useEffect(() => {
    if (!meeting.joined && state.meetingName != null && !state.attemptedJoin) {
      setState({ ...state, attemptedJoin: true });

      dispatch({
        type: 'meeting/join',
        payload: {
          username: `${user.username}`,
          meetingName: `${state.meetingName}`,
          region: 'ap-southeast-1',
          jwtToken: user.jwtToken,
        },
        callback: () => {
          message.success('Joined meeting!');
        },
        error: () => {
          message.error('Robot is offline');
          history.push('/dashboard');
        },
      });
    }
  }, [state, meeting, user, dispatch, history]);

  // cleanup when unmount
  useEffect(() => () => {
    if (meeting.joined) {
      dispatch({
        type: 'meeting/end',
        payload: {
          jwtToken: user.jwtToken,
          meetingName: state.meetingName,
        },
      });
    }
  });
  return (
    <div>
      <ChimeVideoStream
        endpoint={state.endpoint}
        style={{
          position: 'fixed',
          margin: 'auto auto',
          width: '100vw',
          height: '100vh',
          backgroundImage: `url(${Face})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          textAlign: 'center',
          overflow: 'hidden',
          objectFit: 'fill',
        }}
      />
    </div>
  );
};

RobotFace.propTypes = {
  // state: PropTypes.shape({}),
  history: PropTypes.shape({
    push: PropTypes.func,
    location: PropTypes.shape({
      query: PropTypes.shape({
        robotName: null,
      }),
    }),
  }),
  dispatch: PropTypes.func,
  user: PropTypes.shape({
    username: PropTypes.string,
    accessKeyId: PropTypes.string,
    secretAccessKey: PropTypes.string,
    sessionToken: PropTypes.string,
    jwtToken: PropTypes.string,
    robots: PropTypes.arrayOf(PropTypes.shape({})),
  }),
  device: PropTypes.shape({}),
  meeting: PropTypes.shape({
    joined: PropTypes.bool,
  }),
};

RobotFace.defaultProps = {
  // state: {},
  history: {},
  dispatch: undefined,
  device: {},
  user: {},
  meeting: {
    joined: false,
  },
};

export default connect(({ user, device, meeting }) => ({ user, device, meeting }))(RobotFace);
