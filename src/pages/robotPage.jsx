import React, { useState, useRef, useEffect } from 'react';

import PropTypes from 'prop-types';

import { connect } from 'dva';

import {
  Button, message, Input, Menu, Slider, Row, Col, Select,
} from 'antd';
import {
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
const { Option } = Select;

const RobotPage = ({ user, dispatch, history }) => {
  const [state, setState] = useState({
    robotName: null,
    meetingName: null,
    attemptedJoin: false,
    messagebox: null,
    endpoint: null,
    locations: [],
    linearSliderIntensity: 5,
    angularSliderIntensity: 5,
    frequency: 200,
    interval: null,
  });

  const [connectionState, setConnectionState] = useState({
    chimeConnected: false,
    IOTConnected: false,
  });

  const [device, setDevice] = useState(new IOTDevice());
  const [chime, setChime] = useState(new ChimeSession());

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
      let selectedRobot = null;
      if (user.robots.length > 0) {
        // store selected robot information in local state
        selectedRobot = user.robots.find((robot) => robot.robotName === robotName);
        endpoint = selectedRobot.endpoint;
        meetingName = selectedRobot.meetingName;

        setState({
          ...state,
          ...selectedRobot,
        });
      }

      console.log({
        host: endpoint,
        clientID: user.username,
        accessKeyId: user.accessKeyId,
        secretKey: user.secretAccessKey,
        sessionToken: user.sessionToken,
        region: selectedRobot.iotRegion,
      });

      // connect to IOT device
      device.init({
        host: endpoint,
        clientID: user.username,
        accessKeyId: user.accessKeyId,
        secretKey: user.secretAccessKey,
        sessionToken: user.sessionToken,
        region: selectedRobot.iotRegion,
        callback: (event) => {
          if (!isMounted) {
            device.disconnectDevice();
          } else {
            message.success('Controls Connected.');
            setConnectionState({ ...state, IOTConnected: true });
            /*
            - Perform your subscriptions and
            - information collection from robot here
            */

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

            device.subscribeTopic({
              topic: 'np_ros_general_message/cmd_vel/feedback',
              callback: ({ data }) => {
                if (data === 1) {
                  message.warn('Obstacle ahead. Stopping forward movement');
                } else if (data === 2) {
                  message.warn('Obstacle behind. Stopping backwards movement');
                } else if (data === 3) {
                  message.warn('Obstacle beside robot. Stopping rotational movement');
                }
              },
            });
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
    console.log(`Linear Velocity is at level: ${value / 2}`);
  };

  const handleAngularSliding = (value) => {
    setState({ ...state, angularSliderIntensity: value });
    console.log(`Angular Velocity is at level: ${value / 5}`);
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
      topic: '/np_ros_general_message/cmd_vel',
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
      topic: '/np_ros_general_message/cmd_vel',
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
      topic: '/np_ros_general_message/cmd_vel',
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
      topic: '/np_ros_general_message/cmd_vel',
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

  const leaveRoom = () => {
    history.push('/dashboard');
  };

  const muteChime = () => {
    const muteStatus = chime.realtimeIsLocalAudioMuted(audioRef.current);
    if (muteStatus === true) {
      chime.realtimeMuteLocalAudio(audioRef.current);
    } else {
      chime.realtimeUnmuteLocalAudio(audioRef.current);
    }
  };

  const SelectComponent = () => {
    const handleOptionClick = (e) => {
      const location = state.locations[e];
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
      <Select
        style={{ width: '100%' }}
        onChange={handleOptionClick}
        bordered
        placeholder="Select a location"
        size="large"
      >
        {state.locations.map((item, index) => (
          <Option key={index}>{item.name}</Option>
        ))}
      </Select>
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
          <Button type="primary" onClick={muteChime}>
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
          <div style={{
            position: 'fixed',
            width: '20%',
            height: '30%',
            textAlign: 'left',
            float: 'left',
            marginLeft: '2%',
            bottom: '3%',
          }}
          >
            <SelectComponent />
          </div>
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
          min={1}
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
          min={1}
          max={10}
          onChange={handleAngularSliding}
          range={false}
          value={state.angularSliderIntensity}
        />
      </div>

      <div className={style.dpadBox}>
        <Row style={{ margin: '8px' }}>
          <Col span={8} />
          <Col span={8}>
            <Button
              onMouseDown={() => {
                handleMouseDown(handleUp);
              }}
              onMouseUp={handleMouseUp}
              size="large"
            >
              <UpCircleFilled className={style.arrowButton} />
            </Button>
          </Col>
          <Col span={8} />
        </Row>
        <Row style={{ margin: '8px' }}>
          <Col span={8}>
            <Button
              onMouseDown={() => {
                handleMouseDown(handleLeft);
              }}
              onMouseUp={handleMouseUp}
              size="large"
            >
              <LeftCircleFilled className={style.arrowButton} />
            </Button>
          </Col>
          <Col span={8} />
          <Col span={8}>
            <Button
              onMouseDown={() => {
                handleMouseDown(handleRight);
              }}
              onMouseUp={handleMouseUp}
              size="large"
            >
              <RightCircleFilled className={style.arrowButton} />
            </Button>
          </Col>
        </Row>
        <Row style={{ margin: '8px' }}>
          <Col span={8} />
          <Col span={8}>
            <Button
              onMouseDown={() => {
                handleMouseDown(handleDown);
              }}
              onMouseUp={handleMouseUp}
              size="large"
            >
              <DownCircleFilled className={style.arrowButton} />
            </Button>
          </Col>
          <Col span={8} />
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
