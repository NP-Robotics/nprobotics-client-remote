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
    this.started = false;
    this.localTileId = null;
    this.chosenAudioInput = 'default';
    this.chosenVideoInput = 'default';
    this.chosenAudioOutput = 'default';
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
    if (this.audioInput[0]) {
      const audioInputDeviceInfo = this.audioInput[0];
      await this.meetingSession.audioVideo.chooseAudioInputDevice(audioInputDeviceInfo.deviceId);
    }
    if (this.audioOutput[0]) {
      const audioOutputDeviceInfo = this.audioOutput[0];
      await this.meetingSession.audioVideo.chooseAudioOutputDevice(audioOutputDeviceInfo.deviceId);
    }
    if (this.videoInput[0]) {
      const videoInputDeviceInfo = this.videoInput[0];
      await this.meetingSession.audioVideo.chooseVideoInputDevice(videoInputDeviceInfo.deviceId);
    }
    const deviceChangeObserver = {
      audioInputsChanged: (freshAudioInputDeviceList) => {
        this.audioInput = freshAudioInputDeviceList;
      },
      audioOutputsChanged: (freshAudioOutputDeviceList) => {
        this.audioOutput = freshAudioOutputDeviceList;
      },
      videoInputsChanged: (freshVideoInputDeviceList) => {
        this.videoInput = freshVideoInputDeviceList;
      },
    };
    this.meetingSession.audioVideo.addDeviceChangeObserver(deviceChangeObserver);

    const audioVideoObserver = {
      audioVideoDidStart: () => {
        console.log('Started');
        this.started = true;
      },
      audioVideoDidStop: (sessionStatus) => {
        // See the "Stopping a session" section for details.
        console.log('Stopped with a session status code: ', sessionStatus.statusCode());
        this.started = false;
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
  }

  bindAudioElement(audioRef) {
    this.meetingSession.audioVideo.bindAudioElement(audioRef);
  }

  unmuteAudio(audioRef) {
    if (this.started) {
      this.meetingSession.audioVideo.realtimeUnmuteLocalAudio(audioRef);
    }
  }

  muteAudio(audioRef) {
    if (this.started) {
      this.meetingSession.audioVideo.realtimeMuteLocalAudio(audioRef);
    }
  }

  stopLocalVideo() {
    if (this.started) {
      this.meetingSession.audioVideo.stopLocalVideoTile();
    }
  }

  async changeAudioOutput(id) {
    this.chosenAudioOutput = id;
    await this.meetingSession.audioVideo.chooseAudioOutputDevice(id);
  }

  async changeAudioInput(id) {
    this.chosenAudioInput = id;
    await this.meetingSession.audioVideo.chooseAudioInputDevice(id);
  }

  async changeVideoInput(id) {
    this.chosenVideoInput = id;
    await this.meetingSession.audioVideo.chooseVideoInputDevice(id);
  }

  async startLocalVideo() {
    if (this.started) {
      await this.meetingSession.audioVideo.chooseVideoInputDevice(this.chosenVideoInput);
      this.meetingSession.audioVideo.startLocalVideoTile();
    }
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
