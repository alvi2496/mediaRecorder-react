import React, { useState, useCallback, useRef } from "react";
import './index.css';

export default function AudioRecorder({
  onRecordComplete
}) {

  const [audioStream, setaudioStream] = useState(null);
  const [audioRecorder, setaudioRecorder] = useState(null);
  const [recordedBlobs, setRecordedBlobs] = useState([]);
  const [recordedObject, setRecordedObject] = useState(null);
  const [autoplay, setAutoplay] = useState(true);
  const [controls, setControls] = useState(true);
  const [isPlayable, setIsPlayable] = useState(false);
  const [error, setError] = useState(null);
  const audioPlayer = useRef(null);

  /**
   * check whether the mic is currently streaming or not
   * @returns boolean
  */
  const isAudioStreaming = () => {
    return (audioStream && audioStream.active);
  }

  /**
   * check whether the reconding is currently in progress
   * @returns boolean
   */
  const isRecording = () => {
    return (audioRecorder && audioRecorder.state === 'recording');
  }

  /**
   * initialize the user mic and starts it
   * change the state of the micStream to that
   * set the audio source of the audioPlayer to the micStream source
   * through an error if the permission to access mic is denied
   */
  const startMicrophone = useCallback(() => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((mediaStream) => {
        audioPlayer.current.muted = "muted";
        setAutoplay(false);
        setaudioStream(mediaStream);
        audioPlayer.current.srcObject = mediaStream;
      })
      .catch(err => {
        setError(err);
      })
  }, [audioStream]);

  /**
   * stop the user mic from streaming
   * also reset the micStream and audioPlayer source to null
   */
  const stopMicrophone = () => {
    if (audioStream) {
      audioStream.getTracks().forEach(track => track.stop());
    }
    setAutoplay(false);
    setaudioStream(null);
    audioPlayer.current.srcObject = null;
  }

  /**
   * handle what happens after the recording is stopped
   * get all the recorded blobs from the recordedBlobs array and convert to a Blob instance
   * use the URL api to extract an url to the object
   * return the url to the object to the onRecordComplete callback function
   */
  const handleAfterRecordingStop = useCallback(() => {
    const recordedObj = new Blob(recordedBlobs, { type: 'audio/webm' });
    const recordedUrl = URL.createObjectURL(recordedObj);
    audioPlayer.current.autoPlay = false;
    audioPlayer.current.controls = true;
    audioPlayer.current.src = recordedUrl;
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
    const mediaRecorder = new MediaRecorder(audioStream, { mimeType: 'audio/webm' });
    setaudioRecorder(mediaRecorder);

    audioPlayer.current.muted = "muted";
    audioPlayer.current.play();
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
    stopMicrophone();
    audioPlayer.current.muted = null;
    audioRecorder.stop();
  }

  /**
   * callback to play the recording when play recording onClick
   */
  const playRecording = () => {
    audioPlayer.current.muted = null;
    audioPlayer.current.play();
  }

  /**
   * create and return the audio player element depending on the conditions
   * @returns audio player element jsx
   */
  const audioPlayerElement = () => {
    if (!autoplay) {
      return <audio ref={audioPlayer} id="gc__id-audio_stream" controls />
    }
    else if (!controls) {
      return <audio ref={audioPlayer} id="gc__id-audio_stream" autoPlay />
    }
    else if (!autoplay && !controls) {
      return <audio ref={audioPlayer} id="gc__id-audio_stream" />
    }
    else return <audio ref={audioPlayer} id="gc__id-audio_stream" autoPlay controls />
  }

  if (error) {
    console.log(error);
  }

  return error ? <div className="gc__class-audio_recorder_container">error</div> : (
    <div className="gc__class-audio_recorder_container">
      <div className="gc__class-audio_player">
        {audioPlayerElement()}
      </div>
      <div className="gc__class-audio_recorder_buttons_container">
        <button
          onClick={isAudioStreaming() ? stopMicrophone : startMicrophone}
          id="gc__id-btn_start_audio"
        >
          {isAudioStreaming() ? "Stop Microphone" : "Start Microphone"}
        </button>
        <button
          id="start-record"
          onClick={startRecord}
          disabled={!isAudioStreaming() || isRecording() ? true : false}
        >
          {isAudioStreaming() && isRecording() ? "Recording..." : "Start Recording"}
        </button>
        <button
          id="stop-record"
          onClick={isRecording() || isAudioStreaming() ? stopRecord : (isPlayable ? playRecording : stopRecord)}
          disabled={isRecording() ? false : (isPlayable && !isAudioStreaming() ? false : true)}
        >
          {isRecording() || isAudioStreaming() ? "Stop Recording"
            : (isPlayable ? "Play Recording" : "Stop Recording")
          }
        </button>
      </div>
    </div>
  )
}