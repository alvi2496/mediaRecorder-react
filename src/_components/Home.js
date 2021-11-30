import React from "react";
import { Link } from "react-router-dom";

export default function Home(){
    return (
        <div>
            <button>
                <Link to='/video-recorder'>Video Recorder</Link>
            </button>
            <br/>
            <button>
                <Link to='/audio-recorder'>Audio Recorder</Link>
            </button>
        </div>
    )
}