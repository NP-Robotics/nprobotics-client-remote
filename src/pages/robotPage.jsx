import React, {
  useState, useRef, useEffect, useContext,
} from 'react';
import PropTypes from 'prop-types';

import { connect } from 'dva';
import {
  Button, message, Input, Tooltip, Menu, Dropdown,
} from 'antd';
import { ExportOutlined, SmileOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { Joystick } from 'react-joystick-component';

import ChimeVideoStream from '../components/ChimeVideoStream';
import { DeviceContext } from '../context/DeviceConnector';

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
          deviceCtx.disconnectDevice();
          history.push('/dashboard');
        },
      });

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
    }
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
    const vel = y / 200;
    const angle = -x / 250;
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

  const enableChatTextBox = () => {
    setState({ chatTextBox: true });
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
      <Menu.Item key="1">Location1</Menu.Item>
      <Menu.Item key="2">Location2</Menu.Item>
      <Menu.Item key="3">Location3</Menu.Item>
    </Menu>
  );

  return (

    <div style={{ textAlign: 'center', margin: '2%' }}>
      <ChimeVideoStream
        style={{
          width: '50vw',
          height: '50vh',
          backgroundColor: 'black',
          margin: '0 auto',
        }}
      />
      {' '}
      <div className="robotFunctions">
        <div style={{ textAlign: 'center' }}>
          <div
            className="Emote"
            trigger={['click']}
            style={{
              position: 'fixed', right: '5.2%', top: '30%', width: '15%', height: '10%',
            }}
          >
            <Button icon={<SmileOutlined />} onClick={emoteClick}> Emote </Button>
          </div>

          <div
            className="Navigation"
            trigger={['click']}
            style={{
              position: 'fixed', right: '5.2%', top: '35%', width: '15%', height: '10%',
            }}
          >
            <Dropdown overlay={menu}>
              <Button icon={<EnvironmentOutlined />}>Navigate</Button>
            </Dropdown>
          </div>
        </div>

        <div>
          <Tooltip placement="bottom" title={text}>
            <h2>Chat:</h2>
          </Tooltip>
        </div>
        <div>
          <TextArea
            value={state.messagebox}
            onChange={handleChange}
            placeholder="Type message here"
            autoSize={{ minRows: 3, maxRows: 10 }}
            style={{ width: '40%' }}
          />
          <div style={{ margin: '1%' }} />
          <Button
            onMouseOver={changeBackground}
            onClick={sendText}
            style={{ backgroundColor: '#4CAF50', borderRadius: '15%' }}
          >
            Send
          </Button>
        </div>
      </div>

      <div>
        <Button
          onClick={leaveRoom}
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
