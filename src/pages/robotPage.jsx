/* eslint-disable linebreak-style */
/* eslint-disable no-undef */
/* eslint-disable spaced-comment */
/* eslint-disable linebreak-style */
import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

import { connect } from 'dva';
import {
  Button, message, Input, Tooltip, Menu, Dropdown, Row, Col, Divider,
} from 'antd';
import {
  ExportOutlined, SmileOutlined, EnvironmentOutlined, ImportOutlined,
} from '@ant-design/icons';
import { Joystick } from 'react-joystick-component';

import ChimeVideoStream from '../components/ChimeVideoStream';
import style from './robotPage.css';

const { TextArea } = Input;
const text = <span>Type a message that will be said by the robot</span>;

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
  });
  const [componentPos, setComponentPos] = useState({
    locked: false,
    joystick: {
      x: 500,
      y: 500,
    },
  });
  const [componentText, setComponentText] = useState({
    lockButton: 'lock',
  });

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
          history.push('/dashboard');
        },
      }); */

    /* dispatch({
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
    } */
  }, [state, meeting, user, dispatch, history]);

  const joystickRef = useRef(null);

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
      dispatch({
        type: 'device/disconnectDevice',
      });
    }
  });

  const chimeLeaveOnClick = () => {
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

  const sendText = () => {
    const voiceMsg = state.messagebox;
    dispatch({
      type: 'device/publishVoiceMessage',
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
      dispatch({
        type: 'device/disconnectDevice',
      });
    }
    history.push('/dashboard');
  };

  function changeBackground(e) {
    e.target.style.color = 'black';
    e.target.style.borderColor = 'black';
  }

  const emoteClick = () => {
    dispatch({
      type: 'device/publishEmote',
      payload: {
        emote: 'myemote',
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
      <Menu.Item key="2">Location 2</Menu.Item>
      <Menu.Item key="3">Location 3</Menu.Item>
    </Menu>
  );

  const [width, setWidth] = React.useState(window.innerWidth);
  const [height, setHeight] = React.useState(window.innerHeight);

  const updateWidthAndHeight = () => {
    setWidth(window.innerWidth);
    setHeight(window.innerHeight);
  };

  React.useEffect(() => {
    window.addEventListener('resize', updateWidthAndHeight);
    return () => window.removeEventListener('resize', updateWidthAndHeight);
  });

  return (
    <div>
      <div className={style.vid}>
        <ChimeVideoStream />
      </div>
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
        <div className={style.yourVid}>
          <ChimeVideoStream />
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
          <div style={{ color: 'white' }}>
            <div>{`Window width = ${width}`}</div>
            <div>{`Window height = ${height}`}</div>
          </div>
          <div onDragEnd={joystickOnDrag} className={style.joystickBox}>
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
