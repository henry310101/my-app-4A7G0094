import React, { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import './App.css';
import Webspeek from './components/WebSocket/Webspeek';
import Login from "./components/WebSocket/Login";


const App=() => {
  return (
    <BrowserRouter basename="/my-app-4A7G0094">
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/Webspeek" element={<Webspeek />} />
    </Routes>
  </BrowserRouter>

  );
}

export default App;
