import React, { useState, useRef, useEffect } from 'react';

import PropTypes from 'prop-types';
import { connect } from 'dva';

import {
  MeetingSessionConfiguration,
  ConsoleLogger,
  DefaultDeviceController,
  LogLevel,
  DefaultMeetingSession,
  MeetingSessionStatusCode,
} from 'amazon-chime-sdk-js';

const ChimeVideoStream = ({ meeting, style }) => {
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  const [state, setState] = useState({
    meetingSession: null,
  });

  useEffect(() => {
    // if no meeting session
    if (state.meetingSession === null) {
      // if joined meeting
      if (meeting.joined) {
        setupMeeting(meeting.meetingResponse, meeting.attendeeResponse);
      }
    } else {
      // if left meeting
      if (!meeting.joined) {
        leaveMeeting();
      }
    }
  });

  const leaveMeeting = () => {
    const observer = {
      audioVideoDidStop: (sessionStatus) => {
        const sessionStatusCode = sessionStatus.statusCode();
        if (sessionStatusCode === MeetingSessionStatusCode.Left) {
          /*
            - You called meetingSession.audioVideo.stop().
            - When closing a browser window or page, Chime SDK attempts to leave the session.
          */
          console.log('You left the session');
        } else {
          console.log('Stopped with a session status code: ', sessionStatusCode);
        }
      },
    };

    state.meetingSession.audioVideo.addObserver(observer);
    state.meetingSession.audioVideo.stop();
  };

  const setupMeeting = async (meetingResponse, attendeeResponse) => {
    console.log(attendeeResponse);
    const configuration = new MeetingSessionConfiguration(meetingResponse, attendeeResponse);

    const logger = new ConsoleLogger('MyLogger', LogLevel.ERROR);
    const deviceController = new DefaultDeviceController(logger);

    const meetingSession = new DefaultMeetingSession(
      configuration,
      logger,
      deviceController,
    );

    setState({
      ...state,
      meetingSession,
    });

    // get audio devices
    const audioInput = await meetingSession.audioVideo.listAudioInputDevices();
    const audioOutput = await meetingSession.audioVideo.listAudioOutputDevices();
    const videoInput = await meetingSession.audioVideo.listVideoInputDevices();
    // selecting devices from list of devices
    const audioInputDeviceInfo = audioInput[0];
    await meetingSession.audioVideo.chooseAudioInputDevice(audioInputDeviceInfo.deviceId);
    const audioOutputDeviceInfo = audioOutput[0];
    await meetingSession.audioVideo.chooseAudioOutputDevice(audioOutputDeviceInfo.deviceId);
    const videoInputDeviceInfo = videoInput[0];
    await meetingSession.audioVideo.chooseVideoInputDevice(videoInputDeviceInfo.deviceId);

    const deviceChangeObserver = {
      audioInputsChanged: (freshAudioInputDeviceList) => {
        // An array of MediaDeviceInfo objects
        freshAudioInputDeviceList.forEach((mediaDeviceInfo) => {
          console.log(`Device ID: ${mediaDeviceInfo.deviceId} Microphone: ${mediaDeviceInfo.label}`);
        });
      },
      audioOutputsChanged: (freshAudioOutputDeviceList) => {
        console.log('Audio outputs updated: ', freshAudioOutputDeviceList);
      },
      videoInputsChanged: (freshVideoInputDeviceList) => {
        console.log('Video inputs updated: ', freshVideoInputDeviceList);
      },
    };
    meetingSession.audioVideo.addDeviceChangeObserver(deviceChangeObserver);

    // setup observers
    const audioVideoObserver = {
      audioVideoDidStart: () => {
        console.log('Started');
      },
      audioVideoDidStop: (sessionStatus) => {
        // See the "Stopping a session" section for details.
        console.log('Stopped with a session status code: ', sessionStatus.statusCode());
      },
      audioVideoDidStartConnecting: (reconnecting) => {
        if (reconnecting) {
          // e.g. the WiFi connection is dropped.
          console.log('Attempting to reconnect');
        }
      },
    };
    meetingSession.audioVideo.addObserver(audioVideoObserver);

    // bind audio
    meetingSession.audioVideo.bindAudioElement(audioRef.current);

    // bind video
    const observer = {
      // videoTileDidUpdate is called whenever a new tile is created or tileState changes.
      videoTileDidUpdate: (tileState) => {
        // Ignore a tile without attendee ID, a local tile (your video), and a content share.
        if (!tileState.boundAttendeeId || tileState.localTile || tileState.isContent) {
          return;
        }

        meetingSession.audioVideo.bindVideoElement(tileState.tileId, videoRef.current);
      },
    };
    meetingSession.audioVideo.addObserver(observer);
    meetingSession.audioVideo.startLocalVideoTile();

    // start meeting
    meetingSession.audioVideo.start();
  };

  return (
    <div style={style}>
      <video
        ref={videoRef}
        style={{

        }}
      />
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
