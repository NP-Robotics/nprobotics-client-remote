import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

import { connect } from 'dva';
import { message } from 'antd';

import Face from '../assets/face.jpg';
import ChimeSession from '../utils/ChimeSession';
import style from './robotFace.css';

const RobotFace = ({
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

  const [chime, setChime] = useState(new ChimeSession());

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

    // meeting name
    let meetingName = null;

    const robotName = 'Coddie';
    if (user.robots.length > 0) {
      // store selected robot information in local state
      const selectedRobot = user.robots.find((robot) => robot.robotName === robotName);
      meetingName = selectedRobot.meetingName;
      console.log(meetingName);
      setState({
        ...state,
        ...selectedRobot,
      });
    }

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
          message.success('Joined meeting!');
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
  }),
};

RobotFace.defaultProps = {
  // state: {},
  history: {},
  dispatch: undefined,
  user: {},
};

export default connect(({ user }) => ({ user }))(RobotFace);
