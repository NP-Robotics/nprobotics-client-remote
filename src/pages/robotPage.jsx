import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';

import { connect } from 'dva';
import {
  Button, message, Input, Tooltip,
} from 'antd';
import { ExportOutlined } from '@ant-design/icons';
import { Joystick } from 'react-joystick-component';

import ChimeVideoStream from '../components/ChimeVideoStream';

const { TextArea } = Input;
const text = <span>Type a message that will be said by the robot</span>;

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

  const [state, setState] = useState({
    chimeConnect: false,
    chatTextBox: false,
  });

  const joystickRef = useRef(null);

  const chimeConnectOnClick = () => {
    dispatch({
      type: 'meeting/join',
      payload: {
        username: `${user.username}`,
        meetingName: 'testmeeting1',
        region: 'ap-southeast-1',
        jwtToken: user.jwtToken,
      },
      error: (error) => {
        message.error(error.message);
      },

    });

    console.log('button setting');
    setState({ chimeConnect: true });
  };

  const chimeLeaveOnClick = () => {
    dispatch({
      type: 'meeting/end',
      payload: {
        jwtToken: user.jwtToken,
        meetingName: 'fdsgfgds12',
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

  const enableChatTextBox = () => {
    setState({ chatTextBox: true });
  };

  function changeBackground(e) {
    e.target.style.color = 'black';
    e.target.style.borderColor = 'black';
  }

  return (
    <div style={{ textAlign: 'center', margin: '2%' }}>
      <ChimeVideoStream />
      <div className="robotFunctions">
        <div>
          <Tooltip placement="bottom" title={text}>
            <h2>Chat:</h2>
          </Tooltip>
        </div>
        <div>
          <TextArea placeholder="Type message here" autoSize={{ minRows: 3, maxRows: 10 }} style={{ width: '40%' }} />
          <div style={{ margin: '1%' }} />
          <Button onMouseOver={changeBackground} style={{ backgroundColor: '#4CAF50', borderRadius: '15%' }}>Send</Button>
        </div>
      </div>

      <div>
        <Button
          icon={<ExportOutlined />}
          type="primary"
          style={{
            position: 'fixed', right: '2%', top: '9%', backgroundColor: 'red', borderColor: 'red', borderRadius: '15%',
          }}
        >
          Leave
        </Button>
      </div>

      <div
        onDragEnd={joystickOnDrag}
        style={{
          position: 'fixed',
          right: '10%',
          bottom: '15%',
        }}
      >
        <Joystick ref={joystickRef} size={100} baseColor="grey" stickColor="green" move={joystickOnMove} stop={joystickOnStop} />
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
