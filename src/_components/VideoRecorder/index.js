import React, { useState, useCallback, useRef } from "react";
import './index.css';

export default function VideoRecorder({
  onRecordComplete
}) {

  const [cameraStream, setCameraStream] = useState(null);
  const [videoRecorder, setVideoRecorder] = useState(null);
  const [recordedBlobs, setRecordedBlobs] = useState([]);
  const [recordedObject, setRecordedObject] = useState(null);
  const [autoplay, setAutoplay] = useState(true);
  const [controls, setControls] = useState(true);
  const [isPlayable, setIsPlayable] = useState(false);
  const [error, setError] = useState(null);
  const videoPlayer = useRef(null);

  /**
   * check whether the camera is currently streaming or not
   * @returns boolean
  */
  const isCameraStreaming = () => {
    return (cameraStream && cameraStream.active);
  }

  /**
   * check whether the reconding is currently in progress
   * @returns boolean
   */
  const isRecording = () => {
    return (videoRecorder && videoRecorder.state === 'recording');
  }

  /**
   * initialize the user camera and starts it
   * change the state of the cameraStream to that
   * set the video source of the videoPlayer to the cameraStream source
   * through an error if the permission to access camera is denied
   */
  const startCamera = useCallback(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((mediaStream) => {
        setAutoplay(true);
        setCameraStream(mediaStream);
        videoPlayer.current.srcObject = mediaStream;
        videoPlayer.current.muted = "muted";
      })
      .catch(err => {
        setError(err);
      })
  }, [cameraStream]);

  /**
   * stop the user camera from streaming
   * also reset the cameraStream and videoPlayer source to null
   */
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
    }
    setAutoplay(false);
    setCameraStream(null);
    videoPlayer.current.srcObject = null;
  }

  /**
   * handle what happens after the recording is stopped
   * get all the recorded blobs from the recordedBlobs array and convert to a Blob instance
   * use the URL api to extract an url to the object
   * return the url to the object to the onRecordComplete callback function
   */
  const handleAfterRecordingStop = useCallback(() => {
    const recordedObj = new Blob(recordedBlobs, { type: 'video/webm' });
    const recordedUrl = URL.createObjectURL(recordedObj);
    videoPlayer.current.autoPlay = false;
    videoPlayer.current.controls = true;
    videoPlayer.current.src = recordedUrl;
    setAutoplay(false);
    setRecordedBlobs([]);
    recordedUrl ? setIsPlayable(true) : setIsPlayable(false);
    setRecordedObject(recordedObj);
    if (typeof (onRecordComplete) == 'function') {
      onRecordComplete(recordedUrl);
    }
  }, [recordedObject]);

  /**
   * starts the recording
   * push the blobs to the recordedBlobs array when available
   * handle what happen after stop when stopped
   */
  const startRecord = () => {
    const mediaRecorder = new MediaRecorder(cameraStream, { mimeType: 'video/webm' });
    setVideoRecorder(mediaRecorder);

    videoPlayer.current.muted = "muted";

    mediaRecorder.start();

    mediaRecorder.ondataavailable = (e) => {
      setRecordedBlobs(recordedBlobs.push(e.data));
    }

    mediaRecorder.onstop = () => {
      handleAfterRecordingStop();
    }
  }

  /**
   * stops the recording
   */
  const stopRecord = () => {
    stopCamera();
    videoPlayer.current.muted = null;
    videoRecorder.stop();
  }

  /**
   * callback to play the recording when play recording onClick
   */
  const playRecording = () => {
    videoPlayer.current.muted = null;
    videoPlayer.current.play();
  }

  /**
   * create and return the video player element depending on the conditions
   * @returns video player element jsx
   */
  const videoPlayerElement = () => {
    if (!autoplay) {
      return <video ref={videoPlayer} id="gc__id-video_stream" controls />
    }
    else if (!controls) {
      return <video ref={videoPlayer} id="gc__id-video_stream" autoPlay />
    }
    else if (!autoplay && !controls) {
      return <video ref={videoPlayer} id="gc__id-video_stream" />
    }
    else return <video ref={videoPlayer} id="gc__id-video_stream" autoPlay controls />
  }

  if (error) {
    console.log(error);
  }

  return error ? <div className="gc__class-video_recorder_container">error</div> : (
    <div className="gc__class-video_recorder_container">
      <div className="gc__class-video_player">
        {videoPlayerElement()}
      </div>
      <div className="gc__class-video_recorder_buttons_container">
        <button
          onClick={isCameraStreaming() ? stopCamera : startCamera}
          id="gc__id-btn_start_camera"
        >
          {isCameraStreaming() ? "Stop Camera" : "Start Camera"}
        </button>
        <button
          id="start-record"
          onClick={startRecord}
          disabled={!isCameraStreaming() || isRecording() ? true : false}
        >
          {isCameraStreaming() && isRecording() ? "Recording..." : "Start Recording"}
        </button>
        <button
          id="stop-record"
          onClick={isRecording() || isCameraStreaming() ? stopRecord : (isPlayable ? playRecording : stopRecord)}
          disabled={isRecording() ? false : (isPlayable && !isCameraStreaming() ? false : true)}
        >
          {isRecording() || isCameraStreaming() ? "Stop Recording"
            : (isPlayable ? "Play Recording" : "Stop Recording")
          }
        </button>
      </div>
    </div>
  )
}