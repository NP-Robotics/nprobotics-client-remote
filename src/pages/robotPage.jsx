import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';

import { connect } from 'dva';
import { Button, message } from 'antd';
import { Joystick } from 'react-joystick-component';

const RobotPage = ({ user, device, dispatch }) => {
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
  const joystickRef = useRef(null);

  const chimeConnectOnClick = () => {
    dispatch({
      type: 'meeting/join',
      payload: {
        username: user.username,
        meetingName: 'fdsgfgds',
        region: 'us-east-1',
        jwtToken: user.jwtToken,
      },
      callback: (response) => {
        console.log(response);
      },
      error: (error) => {
        message.error(error.message);
      },

    });
  };

  const chimeLeaveOnClick = () => {
    dispatch({
      type: 'meeting/end',
      payload: {
        jwtToken: user.jwtToken,
        meetingName: 'fdsgfgds',
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
  }),
  dispatch: PropTypes.func,
  user: PropTypes.shape({
    username: PropTypes.string,
    accessKeyId: PropTypes.string,
    secretAccessKey: PropTypes.string,
    sessionToken: PropTypes.string,
    jwtToken: PropTypes.string,
  }),
  device: PropTypes.shape({}),

};

RobotPage.defaultProps = {
  // state: {},
  history: {},
  dispatch: undefined,
  device: {},
  user: {},
};

export default connect(({ user, device, meeting }) => ({ user, device, meeting }))(RobotPage);
