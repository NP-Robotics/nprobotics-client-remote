import React, { useState, useRef, useEffect } from 'react';

import PropTypes from 'prop-types';

import { connect } from 'dva';

import {
  Button, message, Input, Menu, Slider, Row, Col,
} from 'antd';
import {
  SmileOutlined,
  ImportOutlined,
  AudioOutlined,
  VideoCameraOutlined,
  UpCircleFilled,
  DownCircleFilled,
  LeftCircleFilled,
  RightCircleFilled,
} from '@ant-design/icons';

import IOTDevice from '../utils/IOTDevice';
import ChimeSession from '../utils/ChimeSession';

import style from './robotPage.css';
// use inline styles for Chime elements

const { TextArea } = Input;

const RobotPage = ({ user, dispatch, history }) => {
  const [state, setState] = useState({
    robotName: null,
    meetingName: null,
    attemptedJoin: false,
    messagebox: null,
    endpoint: null,
    locations: [],
    linearSliderIntensity: 1,
    angularSliderIntensity: 1,
    frequency: 200,
    interval: null,
  });

  const [connectionState, setConnectionState] = useState({
    chimeConnected: false,
    IOTConnected: false,
  });

  const [device, setDevice] = useState(new IOTDevice());
  const [chime, setChime] = useState(new ChimeSession());

  const joystickRef = useRef(null);

  const audioRef = useRef(null);
  const videoRef = useRef(null);

  // component onMount
  useEffect(() => {
    /*
    - variable to check if page is mounted. If page is unmounted variable
    - is set to false.
    -
    - This is to prevent memory leaks
    */
    let isMounted = true;

    // console.log(window);

    // prevent access if query string is missing
    if (!history.location.query.robotName) {
      history.push('/dashboard');
    } else {
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
            setConnectionState({ ...state, IOTConnected: true });

            // get locations
            device.callService({
              topic: '/web_service/retrieve_all_location',
              payload: {
                data: false,
              },
              callback: (response) => {
                setState({ ...state, locations: response.ID });
              },
            });

            window.addEventListener('keydown', (function () {
              let canMove = true;
              return (e) => {
                if (!canMove) return false;
                canMove = false;
                setTimeout(() => { canMove = true; }, state.frequency);
                switch (e.key) {
                  case 'ArrowUp': return handleUp();
                  case 'ArrowDown': return handleDown();
                  case 'ArrowLeft': return handleLeft();
                  case 'ArrowRight': return handleRight();
                  default: // do nothing
                }
                return null;
              };
            }(true)), false);
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
            setConnectionState({ ...state, chimeConnected: true });
            chime.bindVideoElement(videoRef.current);
            chime.bindAudioElement(audioRef.current);
            message.success('Video Connected.');
          }
        },
        error: () => {
          message.error('Meeting room has expired');
          history.push('/dashboard');
        },
      });
    }
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

  const handleLinearSliding = (value) => {
    setState({ ...state, linearSliderIntensity: value });
    console.log(`Linear Velocity is at level: ${state.linearSliderIntensity}`);
  };

  const handleAngularSliding = (value) => {
    setState({ ...state, angularSliderIntensity: value });
    console.log(`Angular Velocity is at level: ${state.angularSliderIntensity / 5}`);
  };

  const handleMouseUp = () => {
    clearInterval(state.interval);
  };

  const handleMouseDown = (movementFunc) => {
    const interval = setInterval(movementFunc, state.frequency);
    setState({ ...state, interval });
  };

  const handleUp = () => {
    console.log('Move forward');
    device.publishMessage({
      topic: '/cmd_vel',
      payload: {
        linear: {
          x: state.linearSliderIntensity / 2,
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

  const handleDown = () => {
    console.log('Backwards');
    device.publishMessage({
      topic: '/cmd_vel',
      payload: {
        linear: {
          x: -state.linearSliderIntensity / 2,
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

  const handleLeft = () => {
    console.log('Turn left');
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
          z: state.angularSliderIntensity / 5,
        },
      },
    });
  };

  const handleRight = () => {
    console.log('Turn right');
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
          z: -state.angularSliderIntensity / 5,
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
    setState({ ...state, messagebox: null });
  };

  const handleChange = (event) => {
    setState({ ...state, messagebox: event.target.value });
  };

  const leaveRoom = () => {
    history.push('/dashboard');
  };

  const changeBackground = (e) => {
    e.target.style.color = 'black';
    e.target.style.borderColor = 'black';
  };

  const emoteClick = () => {
    device.publishMessage({
      topic: '/emote',
      payload: {
        data: 'myemote',
      },
    });
  };

  const MenuComponent = () => {
    const handleMenuClick = (e) => {
      const location = state.locations[e.key];
      device.callService({
        topic: '/web_service/waypoint_sequence',
        payload: {
          sequence: [
            {
              location: location.name,
              task: '',
            },
          ],
        },
        callback: (response) => {
          console.log(response);
        },
      });
    };
    return (
      <Menu onClick={handleMenuClick}>
        {state.locations.map((item, index) => (
          <Menu.Item key={index}>{item.name}</Menu.Item>
        ))}
      </Menu>
    );
  };

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
          <Button onClick={leaveRoom} type="primary" className={style.leaveBtn}>
            <span>
              <ImportOutlined />
            </span>
          </Button>
        </div>
        <div className={style.controlBtn}>
          <Button type="primary">
            <span>
              <AudioOutlined />
            </span>
          </Button>
          <div>
            <Button type="primary">
              <span>
                <VideoCameraOutlined />
              </span>
            </Button>
          </div>
        </div>
        <div>
          <div className={style.naviBox}>
            <div className={style.navi}>
              <div trigger={['click']}>
                <MenuComponent />
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
            <Button onMouseOver={changeBackground} onClick={sendText} className={style.sendBtn}>
              Send
            </Button>
          </div>
        </div>
      </div>

      <div>
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
          <Button onMouseOver={changeBackground} onClick={sendText} className={style.sendBtn}>
            Send
          </Button>
        </div>
      </div>
      <div>
        <div
          style={{
            color: 'white',
            position: 'fixed',
            bottom: '15%',
            marginLeft: '67%',
          }}
        >
          Adjust Linear Velocity
        </div>
        <Slider
          className={style.linearSlider}
          min={0}
          max={10}
          onChange={handleLinearSliding}
          range={false}
          value={state.linearSliderIntensity}
        />
      </div>
      <div>
        <div
          style={{
            color: 'white',
            position: 'fixed',
            bottom: '8%',
            marginLeft: '67%',
          }}
        >
          Adjust Angular Velocity
        </div>
        <Slider
          className={style.angularSlider}
          min={0}
          max={10}
          onChange={handleAngularSliding}
          range={false}
          value={state.angularSliderIntensity}
        />
      </div>

      <div className={style.dpadBox}>
        <Row>
          <Col span={8}>
            <Button
              onMouseDown={() => {
                handleMouseDown(handleUp);
              }}
              onMouseUp={handleMouseUp}
              className={style.upKey}
            >
              <UpCircleFilled className={style.arrowButton} />
            </Button>
          </Col>
        </Row>
        <Row>
          <div style={{ marginLeft: '45px' }}>
            <Button
              onMouseDown={() => {
                handleMouseDown(handleLeft);
              }}
              onMouseUp={handleMouseUp}
              className={style.leftKey}
            >
              <LeftCircleFilled className={style.arrowButton} />
            </Button>
            <Button
              onMouseDown={() => {
                handleMouseDown(handleRight);
              }}
              onMouseUp={handleMouseUp}
              className={style.rightKey}
            >
              <RightCircleFilled className={style.arrowButton} />
            </Button>
          </div>
        </Row>
        <Row>
          <Col span={8}>
            <Button
              onMouseDown={() => {
                handleMouseDown(handleDown);
              }}
              onMouseUp={handleMouseUp}
              className={style.downKey}
            >
              <DownCircleFilled className={style.arrowButton} />
            </Button>
          </Col>
        </Row>
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
