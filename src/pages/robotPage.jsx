import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

import { connect } from 'dva';
import { Button, message } from 'antd';
import { Joystick } from 'react-joystick-component';

import ChimeVideoStream from '../components/ChimeVideoStream';

const RobotPage = ({
  user, meeting, dispatch, history,
}) => {
  const [state, setState] = useState({
    RobotName: null,
    MeetingRoom: null,
  });
  const [componentPos, setComponentPos] = useState({
    locked: false,
    joystick: {
      x: 50,
      y: 50,
    },
  });
  const [componentText, setComponentText] = useState({
    lockButton: 'lock',
  });

  useEffect(() => {
    if (!history.location.query.robotName) {
      history.push('/dashboard');
    }
  });

  // load selected robot into local state
  useEffect(() => {
    if (state.RobotName === null) {
      const { robotName } = history.location.query;
      if (user.robots.length > 0) {
        const selectedRobot = user.robots.find((robot) => robot.RobotName === robotName);
        setState({
          ...state,
          ...selectedRobot,
        });
      }
    }
  }, [state, user.robots, history.location.query]);

  useEffect(() => {
    if (!meeting.joined && state.MeetingRoom != null) {
      console.log('payload', {
        username: `${user.username}`,
        meetingName: `${state.MeetingRoom}`,
        region: 'ap-southeast-1',
        jwtToken: user.jwtToken,
      });
      dispatch({
        type: 'meeting/join',
        payload: {
          username: `${user.username}`,
          meetingName: `${state.MeetingRoom}`,
          region: 'ap-southeast-1',
          jwtToken: user.jwtToken,
        },
        error: (error) => {
          message.error(error.message);
        },
      });
    }
  }, [state, meeting, user, dispatch]);

  const joystickRef = useRef(null);

  const chimeConnectOnClick = () => {

  };

  const chimeLeaveOnClick = () => {
    dispatch({
      type: 'meeting/end',
      payload: {
        jwtToken: user.jwtToken,
        meetingName: state.MeetingRoom,
      },
    });
  };

  const connectOnClick = () => {
    dispatch({
      type: 'device/initDevice',
      payload: {
        host: 'a17t8rhn8oueg6-ats.iot.us-east-1.amazonaws.com',
        clientID: user.username,
        accessKeyId: user.accessKeyId,
        secretKey: user.secretAccessKey,
        sessionToken: user.sessionToken,
      },
      callback: (event) => {
        message.success('Connected!');
      },
      error: (error) => {
        if (error) {
          message.error(error.message);
          return null;
        }
        message.warn('Unable to connect to Robot');
        return null;
      },
    });
  };
  const joystickOnMove = ({ x, y }) => {
    const _vel = y / 200;
    const _angle = -x / 250;
    dispatch({
      type: 'device/publishCmdVel',
      payload: {
        vel: _vel,
        angle: _angle,
      },
    });
  };
  const joystickOnStop = () => {
    dispatch({
      type: 'device/publishCmdVel',
      payload: {
        vel: 0,
        angle: 0,
      },
    });
  };

  const lockOnClick = () => {
    setComponentPos({ ...componentPos, locked: !componentPos.locked });
    if (componentPos.locked) {
      setComponentText({ ...componentText, lockButton: 'lock' });
    } else {
      setComponentText({ ...componentText, lockButton: 'unlock' });
    }
  };

  const joystickOnDrag = (event) => {
    const halfSize = joystickRef.current.props.size / 2;
    setComponentPos({
      ...componentPos,
      joystick: {
        x: event.clientX - halfSize,
        y: event.clientY - halfSize,
      },
    });
  };
  return (
    <div style={{ textAlign: 'center' }}>
      <ChimeVideoStream endpoint={state.endpoint} />
      <h1>robot page</h1>
      <Button onClick={connectOnClick}>connect</Button>
      <Button onClick={lockOnClick}>{componentText.lockButton}</Button>
      <Button onClick={chimeConnectOnClick}>chime connect</Button>
      <Button onClick={chimeLeaveOnClick}> chime leave</Button>

      <div
        draggable={!componentPos.locked}
        onDragEnd={joystickOnDrag}
        style={{
          position: 'absolute',
          left: `${String(componentPos.joystick.x)}px`,
          top: `${String(componentPos.joystick.y)}px`,
        }}
      >
        <Joystick ref={joystickRef} size={100} baseColor="red" stickColor="blue" move={joystickOnMove} stop={joystickOnStop} disabled={!componentPos.locked} />
      </div>
    </div>
  );
};

RobotPage.propTypes = {
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

RobotPage.defaultProps = {
  // state: {},
  history: {},
  dispatch: undefined,
  device: {},
  user: {},
  meeting: {
    joined: false,
  },
};

export default connect(({ user, device, meeting }) => ({ user, device, meeting }))(RobotPage);
