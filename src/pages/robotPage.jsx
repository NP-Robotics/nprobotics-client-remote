import React, {
  useState, useRef, useEffect,
} from 'react';
import PropTypes from 'prop-types';

import { connect } from 'dva';
import {
  Button, message, Input, Menu,
} from 'antd';
import { SmileOutlined, ImportOutlined } from '@ant-design/icons';
import { Joystick } from 'react-joystick-component';

import IOTDevice from '../utils/IOTDevice';
import ChimeSession from '../utils/ChimeSession';

import style from './robotPage.css';

const { TextArea } = Input;

const RobotPage = ({
  user, dispatch, history,
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

  const [device, setDevice] = useState(new IOTDevice());
  const [chime, setChime] = useState(new ChimeSession());

  const joystickRef = useRef(null);

  const audioRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    /*
    - variable to check if page is mounted. If page is unmounted variable
    - is set to false.
    -
    - This is to prevent memory leaks
    */
    let isMounted = true;

    // prevent access if query string is missing
    if (!history.location.query.robotName) {
      history.push('/dashboard');
    }

    // load selected robot into local state
    let endpoint = null;

    // meeting name
    let meetingName = null;

    const { robotName } = history.location.query;
    if (user.robots.length > 0) {
      // store selected robot information in local state
      const selectedRobot = user.robots.find((robot) => robot.robotName === robotName);
      endpoint = selectedRobot.endpoint;
      meetingName = selectedRobot.meetingName;

      setState({
        ...state,
        ...selectedRobot,
      });
    }

    // connect to IOT device
    device.init({
      host: endpoint,
      clientID: user.username,
      accessKeyId: user.accessKeyId,
      secretKey: user.secretAccessKey,
      sessionToken: user.sessionToken,
      region: 'us-east-1',
      callback: (event) => {
        if (!isMounted) {
          device.disconnectDevice();
        } else {
          message.success('Controls Connected.');
        }
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

    // join chime meeting
    dispatch({
      type: 'user/joinMeeting',
      payload: {
        username: `${user.username}`,
        meetingName: `${meetingName}`,
        region: 'ap-southeast-1',
        jwtToken: user.jwtToken,
      },
      callback: async ({ Meeting, Attendee }) => {
        if (isMounted) {
          await chime.init({ Meeting, Attendee });
          chime.bindVideoElement(videoRef.current);
          chime.bindAudioElement(audioRef.current);
          message.success('Video Connected.');
        }
      },
      error: () => {
        message.error('Robot is offline');
        history.push('/dashboard');
      },
    });

    // cleanup when unmount
    return () => {
      isMounted = false;

      if (chime.meetingSession) {
        chime.endMeeting();
      }
      if (device.device) {
        device.disconnectDevice();
      }
    };
  }, []);

  const joystickOnMove = ({ x, y }) => {
    console.log('move');
    const vel = y / 20;
    const angle = -x / 25;
    device.publishMessage({
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
    device.publishMessage({
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
    device.publishMessage({
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
    history.push('/dashboard');
  };

  function changeBackground(e) {
    e.target.style.color = 'black';
    e.target.style.borderColor = 'black';
  }

  const emoteClick = () => {
    device.publishMessage({
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
      <audio ref={audioRef} />
      <video
        style={{
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
        ref={videoRef}
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
              throttle={100}
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
};

RobotPage.defaultProps = {
  // state: {},
  history: {},
  dispatch: undefined,
  user: {},
};

export default connect(({ user, meeting }) => ({ user, meeting }))(RobotPage);
