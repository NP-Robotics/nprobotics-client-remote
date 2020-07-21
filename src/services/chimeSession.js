import {
  MeetingSessionConfiguration,
  ConsoleLogger,
  DefaultDeviceController,
  LogLevel,
  DefaultMeetingSession,
} from 'amazon-chime-sdk-js';

let meetingSession = null;

export const setupAudioVideo = async () => {
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
};

export const setupObservers = () => {
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
};

export const bindVideoElement = (videoRef) => {
  const observer = {
    // videoTileDidUpdate is called whenever a new tile is created or tileState changes.
    videoTileDidUpdate: (tileState) => {
      // Ignore a tile without attendee ID, a local tile (your video), and a content share.
      if (!tileState.boundAttendeeId || tileState.localTile || tileState.isContent) {
        return;
      }

      meetingSession.audioVideo.bindVideoElement(tileState.tileId, videoRef);
    },
  };
  meetingSession.audioVideo.addObserver(observer);
  meetingSession.audioVideo.startLocalVideoTile();
};

export const bindAudioElement = (audioRef) => {
  meetingSession.audioVideo.bindAudioElement(audioRef);
};

export const startMeetingSession = () => {
  meetingSession.audioVideo.start();
};

export const initMeeting = async (Meeting, Attendee) => {
  const configuration = new MeetingSessionConfiguration(Meeting, Attendee);

  const logger = new ConsoleLogger('MyLogger', LogLevel.ERROR);
  const deviceController = new DefaultDeviceController(logger);

  meetingSession = new DefaultMeetingSession(
    configuration,
    logger,
    deviceController,
  );

  await setupAudioVideo();

  setupObservers();
};
