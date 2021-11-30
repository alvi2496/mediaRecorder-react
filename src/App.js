import React from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from "./_components/Home";

export default function App() {
  return (
      <BrowserRouter>
        <Routes>
            <Route path='/' element={<Home />} />
        </Routes>
      </BrowserRouter>
  )
}