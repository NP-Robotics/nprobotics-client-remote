import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

import { connect } from 'dva';
import {
  Button, message, Input, Tooltip, Menu, Dropdown,
} from 'antd';
import { ExportOutlined, SmileOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { Joystick } from 'react-joystick-component';

import ChimeVideoStream from '../components/ChimeVideoStream';

const { TextArea } = Input;
const text = <span>Type a message that will be said by the robot</span>;

const RobotPage = ({
  user, meeting, dispatch, history,
}) => {
  const [state, setState] = useState({
    robotName: null,
    meetingName: null,
    attemptedJoin: false,
    chimeConnect: false,
    chatTextBox: false,
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
          history.push('/dashboard');
        },
      });
    }
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

  const menu = (
    <Menu>
      <Menu.Item>
        <Button>Location1</Button>
      </Menu.Item>
      <Menu.Item>
        <Button>Location2</Button>
      </Menu.Item>
      <Menu.Item>
        <Button>Location3</Button>
      </Menu.Item>
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
      <Button onClick={connectOnClick}>connect IOT</Button>

      <div className="robotFunctions">
        <div style={{ textAlign: 'center' }}>
          <div
            className="Emote"
            trigger={['click']}
            style={{
              position: 'fixed', right: '5%', top: '30%', width: '15%', height: '10%',
            }}
          >
            <Button icon={<SmileOutlined />} onClick={emoteClick}>Emote</Button>
          </div>

          <div
            className="Navigation"
            trigger={['click']}
            style={{
              position: 'fixed', right: '5%', top: '40%', width: '15%', height: '10%',
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
