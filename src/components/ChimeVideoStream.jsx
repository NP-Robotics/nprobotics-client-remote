import React, { useState, useRef, useEffect } from 'react';

import PropTypes from 'prop-types';
import { connect } from 'dva';

import {
  initMeeting,
  endMeeting,

} from '../utils/chimeSession';

const ChimeVideoStream = ({ meeting, style }) => {
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  const [state, setState] = useState({
    inProgress: false,
  });

  useEffect(() => {
    // if no meeting session
    if (!state.inProgress) {
      // if joined meeting
      if (meeting.joined) {
        initMeeting(meeting.meetingResponse, meeting.attendeeResponse,
          audioRef.current, videoRef.current);

        setState({
          ...state,
          inProgress: true,
        });
      }
    } else {
      // if left meeting
      /* if (!meeting.joined) {
        setState({
          ...state,
          inProgress: false,
        });
        console.log('leaving');
        endMeeting();
      } */
    }
  }, [state, meeting]);

  useEffect(() => () => {
    if (state.inProgress) {
      endMeeting();
      setState({
        ...state,
        inProgress: false,
      });
    }
  });

  return (
    <div style={style}>
      <video ref={videoRef} />
      <audio ref={audioRef} />
    </div>
  );
};

ChimeVideoStream.propTypes = {
  meeting: PropTypes.shape({
    joined: PropTypes.bool,
    meetingResponse: PropTypes.shape({}),
    attendeeResponse: PropTypes.shape({}),
  }),
  style: PropTypes.shape({}),
};

ChimeVideoStream.defaultProps = {
  meeting: {
    joined: false,
    meetingResponse: null,
    attendeeResponse: null,
  },
  style: {},
};

export default connect(({ meeting }) => ({ meeting }))(ChimeVideoStream);
