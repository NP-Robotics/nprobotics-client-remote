import React, {
  useState, useRef, useEffect, useContext,
} from 'react';
import PropTypes from 'prop-types';

import { connect } from 'dva';
import {
  Button, message, Input, Menu,
} from 'antd';
import { SmileOutlined, ImportOutlined } from '@ant-design/icons';
import { Joystick } from 'react-joystick-component';

import ChimeVideoStream from '../components/ChimeVideoStream';
import { DeviceContext } from '../context/DeviceConnector';
import style from './robotPage.css';

const { TextArea } = Input;

const RobotPage = ({
  user, meeting, dispatch, history, messagebox,
}) => {
  const [state, setState] = useState({
    robotName: null,
    meetingName: null,
    attemptedJoin: false,
    chimeConnect: false,
    chatTextBox: false,
    messagebox: null,
    endpoint: null,
  });

  const joystickRef = useRef(null);

  const deviceCtx = useContext(DeviceContext);

  // prevent access if query string is missing
  useEffect(() => {
    if (!history.location.query.robotName) {
      history.push('/dashboard');
    }
  });

  // load selected robot into local state
  useEffect(() => {
    if (state.robotName === null) {
      const { robotName } = history.location.query;
      if (user.robots.length > 0) {
        const selectedRobot = user.robots.find((robot) => robot.robotName === robotName);
        console.log(selectedRobot);
        setState({
          ...state,
          ...selectedRobot,
        });
      }
    }
  }, [state, user.robots, history.location.query]);

  // join meeting if all parameters are present
  useEffect(() => {
    /* if (!meeting.joined && state.meetingName != null && !state.attemptedJoin) {
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
          deviceCtx.disconnectDevice();
          history.push('/dashboard');
        },
      });
      console.log(deviceCtx);

      deviceCtx.initDevice({
        payload: {
          host: state.endpoint,
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
    } */
  }, [state, meeting, user, dispatch, history, deviceCtx]);

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

  const joystickOnMove = ({ x, y }) => {
    const vel = y / 20;
    const angle = -x / 25;
    deviceCtx.publishMessage({
      topic: '/cmd_vel',
      payload: {
        linear: {
          x: vel,
          y: 0,
          z: 0,
        },
        angular: {
          x: 0,
          y: 0,
          z: angle,
        },
      },
    });
  };

  const joystickOnStop = () => {
    deviceCtx.publishMessage({
      topic: '/cmd_vel',
      payload: {
        linear: {
          x: 0,
          y: 0,
          z: 0,
        },
        angular: {
          x: 0,
          y: 0,
          z: 0,
        },
      },
    });
  };

  const sendText = () => {
    const voiceMsg = state.messagebox;
    deviceCtx.publishMessage({
      topic: '/voice_message',
      payload: {
        data: voiceMsg,
      },
    });
    setState({ messagebox: null });
  };

  const handleChange = (event) => {
    setState({ messagebox: event.target.value });
  };

  const leaveRoom = () => {
    if (meeting.joined) {
      dispatch({
        type: 'meeting/end',
        payload: {
          jwtToken: user.jwtToken,
          meetingName: state.meetingName,
        },
      });
    }
    history.push('/dashboard');
  };

  function changeBackground(e) {
    e.target.style.color = 'black';
    e.target.style.borderColor = 'black';
  }

  const emoteClick = () => {
    deviceCtx.publishMessage({
      topic: '/emote',
      payload: {
        data: 'myemote',
      },
    });
  };

  const handleMenuClick = (e) => {
    console.log('click', e);
    if (e.key === '1') {
      dispatch({
        type: 'device/publishNavigate',
        payload: {
          location: 1,
        },
      });
    } else if (e.key === '2') {
      dispatch({
        type: 'device/publishNavigate',
        payload: {
          location: 2,
        },
      });
    } else if (e.key === '3') {
      dispatch({
        type: 'device/publishNavigate',
        payload: {
          location: 3,
        },
      });
    }
  };

  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="1">Location 1</Menu.Item>
      <Menu.Item key="2">Location 2</Menu.Item>
      <Menu.Item key="3">Location 3</Menu.Item>
      <Menu.Item key="4">Location 2</Menu.Item>
      <Menu.Item key="5">Location 3</Menu.Item>
    </Menu>
  );

  return (
    <div>
      <ChimeVideoStream style={{
        position: 'fixed',
        margin: 'auto auto',
        width: '100vw',
        height: '100vh',
        background: 'black',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        textAlign: 'center',
        zIndex: '-2',
      }}
      />
      <div>
        <div>
          <Button
            onClick={leaveRoom}
            type="primary"
            className={style.leaveBtn}
          >
            <span>
              <ImportOutlined />
            </span>
          </Button>
        </div>
        <div>
          <div className={style.naviBox}>
            <div className={style.navi}>
              <div trigger={['click']}>
                {menu}
              </div>
            </div>
          </div>
          <div className={style.message}>
            <div className={style.emote} trigger={['click']}>
              <SmileOutlined onClick={emoteClick} />
            </div>
            <TextArea
              value={state.messagebox}
              onChange={handleChange}
              placeholder="Enter a message for the robot to say"
              autoSize={{ minRows: 1, maxRows: 1 }}
              className={style.textBox}
            />
            <Button
              onMouseOver={changeBackground}
              onClick={sendText}
              className={style.sendBtn}
            >
              Send
            </Button>
          </div>
          <div className={style.joystickBox}>
            <Joystick
              ref={joystickRef}
              size={100}
              baseColor="grey"
              stickColor="blue"
              move={joystickOnMove}
              stop={joystickOnStop}
            />
          </div>
        </div>
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
  messagebox: PropTypes.shape({}),
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
  messagebox: {},
};

export default connect(({ user, device, meeting }) => ({ user, device, meeting }))(RobotPage);
