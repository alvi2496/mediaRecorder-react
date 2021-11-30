import React from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from "./_components/Home";
import VideoRecorder from "./_components/VideoRecorder";

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
        </Routes>
      </BrowserRouter>
  )
}