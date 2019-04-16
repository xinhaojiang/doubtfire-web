import { OnInit } from '@angular/core';

export abstract class BaseAudioRecorderComponent implements OnInit {

  // fields
  protected mediaRecorder: any = null;
  protected recordingAvailable: Boolean = false;
  protected isRecording: Boolean = false;
  protected isPlaying: Boolean = false;
  protected audio: HTMLAudioElement;

  abstract canvas: HTMLCanvasElement;
  abstract canvasCtx: CanvasRenderingContext2D;

  protected blob: Blob;
  // private chunks: Array;

  // Properties
  get canRecord(): boolean {
    return Boolean(navigator && navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  constructor(
    private mediaRecorderService: any,
  ) {
  }

  ngOnInit() {
    if (this.canRecord) {
      this.init();
    }
  }

  protected init(): void {
    this.mediaRecorder = new this.mediaRecorderService();
    // Required for recording multiple times
    this.mediaRecorder.config.stopTracksAndCloseCtxWhenFinished = true;
    // Required for visualising the stream
    this.mediaRecorder.config.createAnalyserNode = true;
    this.mediaRecorder.em.addEventListener('recording', (evt: any) => this.onNewRecording(evt));

    // this.chunks = [];
    // this.blob = {};

    // Need to get non-angular bindable components
  }

  playStop(): void {
    if (this.audio.paused) {
      this.audio.play();
      this.isPlaying = true;
    } else {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.isPlaying = false;
    }
  }

  recordingToggle(): void {
    if (!this.isRecording) {
      this.mediaRecorder.startRecording();
      this.visualise();
      this.isRecording = true;
    } else if (this.isRecording) {
      this.mediaRecorder.stopRecording();
      this.isRecording = false;
    }
  }

  onNewRecording(evt: any): void {
    this.blob = evt.detail.recording;
    this.audio.src = evt.detail.recording.blobUrl;
    this.audio.load();
    // $scope.$apply(() => $scope.recordingAvailable = true);
    this.recordingAvailable = true;
  }

  protected abstract sendRecording(): void;
  protected abstract visualise(): void;
}
