import React from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from "./_components/Home";
import VideoRecorder from "./_components/VideoRecorder";
import AudioRecorder from "./_components/AudioRecorder";

export default function App() {
  return (
      <BrowserRouter>
        <Routes>
            <Route path='/' element={<Home />} />
            <Route 
                exact path='/video-recorder' 
                element={
                    <VideoRecorder 
                        onRecordComplete={(recordedVideoUrl) => console.log(recordedVideoUrl)} 
                    />
                } 
            />
            <Route
                exact path='/audio-recorder'
                element={
                    <AudioRecorder 
                        onRecordComplete={(recordedAudioUrl) => console.log(recordedAudioUrl)}
                    />
                }
            />
        </Routes>
      </BrowserRouter>
  )
}