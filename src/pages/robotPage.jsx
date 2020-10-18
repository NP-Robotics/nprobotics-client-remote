import React, { useState, useRef, useEffect } from 'react';

import PropTypes from 'prop-types';

import { connect } from 'dva';

import {
  Button, message, Input, Slider, Row, Col, Select,
} from 'antd';
import {
  ImportOutlined,
  AudioOutlined,
  AudioMutedOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
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
    angularSliderIntensity: 10,
    msgDelay: 500,
    interval: null,
    audioMuted: false,
    videoStopped: false,
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

      // connect to IOT device
      device.init({
        host: endpoint,
        clientId: user.username,
        organisation: user.organisation,
        thingId: selectedRobot.clientId,
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
            /*--------------------------------------------------
            - Perform your subscriptions and
            - information collection from robot here
            ----------------------------------------------------*/

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
              topic: '/np_ros_general_message/cmd_vel/feedback',
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

      // join chime meeting
      dispatch({
        type: 'user/joinMeeting',
        payload: {
          username: `${user.username}`,
          meetingName: `${meetingName}`,
          region: 'ap-southeast-1',
          isRobot: false,
          jwtToken: user.jwtToken,
        },
        callback: async ({ Meeting, Attendee }) => {
          if (isMounted) {
            await chime.init({ Meeting, Attendee });
            setConnectionState({ ...state, chimeConnected: true });
            chime.bindVideoElement(videoRef.current);
            chime.bindAudioElement(audioRef.current);
            await chime.startLocalVideo();
            message.success('Video Connected.');
          }
        },
        error: () => {
          message.error('Robot is offline.');
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

  /*
  - useEffect for adding keyboard controls to the DOM. Runs when
  - sliderintensity or interval inside the state updates.
  */
  useEffect(() => {
    const keydownHandler = (e) => {
      if (e.repeat || state.interval !== null) {
        return null;
      }
      switch (e.key) {
        case 'ArrowUp': return handleMouseDown(handleUp);
        case 'ArrowDown': return handleMouseDown(handleDown);
        case 'ArrowLeft': return handleMouseDown(handleLeft);
        case 'ArrowRight': return handleMouseDown(handleRight);
        default: // do nothing
      }
      return null;
    };

    const keyupHandler = () => {
      handleMouseUp();
    };
    window.addEventListener('keydown', keydownHandler);
    window.addEventListener('keyup', keyupHandler);

    return () => {
      window.removeEventListener('keydown', keydownHandler);
      window.removeEventListener('keyup', keyupHandler);
    };
  }, [state]);

  /* ------Handlers for sliders---------*/
  const handleLinearSliding = (value) => {
    setState({ ...state, linearSliderIntensity: value });
    console.log(`Linear Velocity is at level: ${value / 20}`);
  };

  const handleAngularSliding = (value) => {
    setState({ ...state, angularSliderIntensity: value });
    console.log(`Angular Velocity is at level: ${value / 5}`);
  };
  /*----------------------------------*/

  /* ------Handlers for D-Pad---------*/

  const handleMouseUp = () => {
    clearInterval(state.interval);
    setState({ ...state, interval: null });
  };

  const handleMouseDown = (movementFunc) => {
    const interval = setInterval(movementFunc, state.msgDelay);
    setState({ ...state, interval });
  };

  const handleUp = () => {
    console.log('Move forward');
    device.publishMessage({
      topic: '/np_ros_general_message/cmd_vel',
      payload: {
        linear: {
          x: state.linearSliderIntensity / 20,
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
          x: -state.linearSliderIntensity / 20,
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
  /*---------------------------------*/

  /* ------Handlers for Chime interaction---------*/

  const leaveRoom = () => {
    history.push('/dashboard');
  };

  const muteChime = () => {
    if (!state.audioMuted) {
      chime.muteAudio(audioRef.current);
      setState({
        ...state,
        audioMuted: true,
      });
    } else {
      chime.unmuteAudio(audioRef.current);
      setState({
        ...state,
        audioMuted: false,
      });
    }
  };

  const stopVideo = async () => {
    if (!state.videoStopped) {
      chime.stopLocalVideo();
      setState({
        ...state,
        videoStopped: true,
      });
    } else {
      await chime.startLocalVideo();
      setState({
        ...state,
        videoStopped: false,
      });
    }
  };

  const VideoIcon = () => {
    if (state.videoStopped) {
      return <EyeInvisibleOutlined />;
    }

    return <EyeOutlined />;
  };

  const AudioIcon = () => {
    if (state.audioMuted) {
      return <AudioMutedOutlined />;
    }

    return <AudioOutlined />;
  };
  /*---------------------------------*/

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
      <Row
        style={{
          width: '30%',
          height: '30%',
          float: 'right',
          margin: '10px',
        }}
        gutter={[16, 16]}
      >
        <Col span={8}>
          <Select style={{ width: '100%' }} placeholder="Webcam" onChange={async (e) => { await chime.changeVideoInput(e); }}>
            {
            (() => {
              if (Array.isArray(chime.videoInput)) {
                return (
                  chime.videoInput.map((item) => (
                    <Option key={item.deviceId}>{item.label}</Option>
                  ))
                );
              }

              return null;
            })()
          }
          </Select>
        </Col>
        <Col span={8}>
          <Select style={{ width: '100%' }} placeholder="Speaker" onChange={async (e) => { await chime.changeAudioOutput(e); }}>
            {
            (() => {
              if (Array.isArray(chime.audioOutput)) {
                return (
                  chime.audioOutput.map((item) => (
                    <Option key={item.deviceId}>{item.label}</Option>
                  ))
                );
              }

              return null;
            })()
          }
          </Select>
        </Col>
        <Col span={8}>
          <Select style={{ width: '100%' }} placeholder="Microphone" onChange={async (e) => { await chime.changeAudioInput(e); }}>
            {
            (() => {
              if (Array.isArray(chime.audioInput)) {
                return (
                  chime.audioInput.map((item) => (
                    <Option key={item.deviceId}>{item.label}</Option>
                  ))
                );
              }

              return null;
            })()
          }
          </Select>
        </Col>
      </Row>
      <div>
        <div>
          <Button onClick={leaveRoom} type="primary" className={style.leaveBtn} size="large">
            <span>
              <ImportOutlined />
            </span>
          </Button>
        </div>
        <div className={style.controlBtn}>
          <Button type="primary" onClick={muteChime} size="large" style={{ marginTop: '5px' }}>
            <AudioIcon />
          </Button>
          <div>
            <Button type="primary" onClick={stopVideo} size="large" style={{ marginTop: '5px' }}>
              <span>
                <VideoIcon />
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
    organisation: PropTypes.string,
  }),
};

RobotPage.defaultProps = {
  // state: {},
  history: {},
  dispatch: undefined,
  user: {},
};

export default connect(({ user, meeting }) => ({ user, meeting }))(RobotPage);
