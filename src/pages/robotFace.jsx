import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

import { connect } from 'dva';
import { message } from 'antd';

import Face from '../assets/neutral.gif';
import ChimeSession from '../utils/ChimeSession';
import IOTBridge from '../utils/IOTBridge';

import style from './robotFace.css';
// use inline styles for Chime-related elements

const RobotFace = ({ user, dispatch, history }) => {
  const [state, setState] = useState({
    robotName: null,
    clientId: null,
    meetingName: null,
    attemptedJoin: false,
    chimeConnect: false,
    chatTextBox: false,
    messagebox: null,
    endpoint: null,
  });

  const [chime, setChime] = useState(new ChimeSession());
  const [bridge, setBridge] = useState(new IOTBridge());

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

    // load selected robot into local state
    let endpoint = null;
    let meetingName = null;

    const { robotName } = history.location.query;

    if (robotName == null) {
      history.push('/dashboard');
    } else {
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

      if (selectedRobot.rosConfig != null) {
        bridge.initIOT({
          host: endpoint,
          clientId: selectedRobot.clientId,
          accessKeyId: user.accessKeyId,
          secretKey: user.secretAccessKey,
          sessionToken: user.sessionToken,
          region: selectedRobot.iotRegion,
          organisation: user.organisation,
          callback: (event) => {
            if (!isMounted) {
              bridge.disconnectDevice();
            } else {
              message.success('IOT Core Connected.');
              /*--------------------------------------------------
          - Perform your subscriptions and
          - information collection from robot here
          ----------------------------------------------------*/
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

        bridge.initROS({
          url: selectedRobot.rosbridgeUrl,
          bridgeConfig: selectedRobot.rosConfig,
          callback: () => {
            message.success('ROSBridge connected.');
          },
        });
      }

      // join chime meeting
      dispatch({
        type: 'user/joinMeeting',
        payload: {
          username: `${user.username}`,
          meetingName: `${meetingName}`,
          region: 'ap-southeast-1',
          isRobot: true,
          jwtToken: user.jwtToken,
        },
        callback: async ({ Meeting, Attendee }) => {
          if (isMounted) {
            await chime.init({ Meeting, Attendee });
            chime.bindVideoElement(videoRef.current);
            chime.bindAudioElement(audioRef.current);
            await chime.startLocalVideo();
            message.success('Chime Connected.');
          }
        },
        error: () => {
          message.error('This should never happen');
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

      if (bridge.ros) {
        bridge.cleanup();
      }
    };
  }, []);

  return (
    <div>
      <audio ref={audioRef} />
      <video
        style={{
          position: 'fixed',
          margin: 'auto auto',
          width: '100vw',
          height: '100vh',
          backgroundImage: `url(${Face})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          textAlign: 'center',
          overflow: 'hidden',
          objectFit: 'fill',
        }}
        ref={videoRef}
      />
    </div>
  );
};

RobotFace.propTypes = {
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

RobotFace.defaultProps = {
  // state: {},
  history: {},
  dispatch: undefined,
  user: {},
};

export default connect(({ user }) => ({ user }))(RobotFace);
