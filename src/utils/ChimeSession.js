import {
  MeetingSessionConfiguration,
  ConsoleLogger,
  DefaultDeviceController,
  LogLevel,
  DefaultMeetingSession,
  MeetingSessionStatusCode,
} from 'amazon-chime-sdk-js';

class ChimeSession {
  constructor() {
    this.meetingSession = null;
    this.audioInput = null;
    this.videoInput = null;
    this.videoOutput = null;
  }

  async init({ Meeting, Attendee }) {
    const configuration = new MeetingSessionConfiguration(Meeting, Attendee);

    const logger = new ConsoleLogger('MyLogger', LogLevel.ERROR);
    const deviceController = new DefaultDeviceController(logger);

    this.meetingSession = new DefaultMeetingSession(
      configuration,
      logger,
      deviceController,
    );
    this.audioInput = await this.meetingSession.audioVideo.listAudioInputDevices();
    this.audioOutput = await this.meetingSession.audioVideo.listAudioOutputDevices();
    this.videoInput = await this.meetingSession.audioVideo.listVideoInputDevices();
    // selecting devices from list of devices
    const audioInputDeviceInfo = this.audioInput[0];
    await this.meetingSession.audioVideo.chooseAudioInputDevice(audioInputDeviceInfo.deviceId);
    const audioOutputDeviceInfo = this.audioOutput[0];
    await this.meetingSession.audioVideo.chooseAudioOutputDevice(audioOutputDeviceInfo.deviceId);
    const videoInputDeviceInfo = this.videoInput[0];
    await this.meetingSession.audioVideo.chooseVideoInputDevice(videoInputDeviceInfo.deviceId);

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
    this.meetingSession.audioVideo.addDeviceChangeObserver(deviceChangeObserver);

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
    this.meetingSession.audioVideo.addObserver(audioVideoObserver);

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
    this.meetingSession.audioVideo.addObserver(observer);

    this.meetingSession.audioVideo.start();
  }

  bindVideoElement(videoRef) {
    const observer = {
      // videoTileDidUpdate is called whenever a new tile is created or tileState changes.
      videoTileDidUpdate: (tileState) => {
        // Ignore a tile without attendee ID, a local tile (your video), and a content share.
        if (!tileState.boundAttendeeId || tileState.localTile || tileState.isContent) {
          return;
        }

        this.meetingSession.audioVideo.bindVideoElement(tileState.tileId, videoRef);
      },
    };
    this.meetingSession.audioVideo.addObserver(observer);
    this.meetingSession.audioVideo.startLocalVideoTile();
  }

  bindAudioElement(audioRef) {
    this.meetingSession.audioVideo.bindAudioElement(audioRef);
  }

  realtimeIsLocalAudioMuted(audioRef) {
    const results = this.meetingSession.audioVideo.realtimeIsLocalAudioMuted(audioRef);
    return results;
  }

  realtimeUnmuteLocalAudio(audioRef) {
    this.meetingSession.audioVideo.realtimeUnmuteLocalAudio(audioRef);
  }

  realtimeMuteLocalAudio(audioRef) {
    this.meetingSession.audioVideo.realtimeMuteLocalAudio(audioRef);
  }

  endMeeting() {
    // Select no video device (releases any previously selected device)
    this.meetingSession.audioVideo.chooseVideoInputDevice(null);

    // Stop local video tile (stops sharing the video tile in the meeting)
    this.meetingSession.audioVideo.stopLocalVideoTile();

    this.meetingSession.audioVideo.stop();
  }
}

export default ChimeSession;
