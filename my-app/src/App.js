import React, { useState } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import './App.css';
import Auth from "./components/WebSocket/Auth";
import Homepage from "./components/WebSocket/Homepage";
import WebSocket from './components/WebSocket/WebSocket';
import Navbar from "./components/WebSocket/Navbar";
import FilePage from "./components/WebSocket/FilePage";
import Record from "./components/WebSocket/Record";

const App = () => {
  const [loggedIn, setLoggedIn] = useState(false);

  const handleLogin = () => {
    setLoggedIn(true);
  };

  const handleLogout = () => {
    setLoggedIn(false);
  };

  return (
    <BrowserRouter>
      {loggedIn && <Navbar onLogout={handleLogout} />}
      <Routes>
        <Route path="/"
          element={!loggedIn ? (<Auth loggedIn={loggedIn} onLogin={handleLogin} onLogout={handleLogout} />) : (<Navigate to="/Homepage" />)}
        />
        <Route path="/Homepage"
          element={loggedIn ? <Homepage /> : <Navigate to="/" />}
        />
        <Route path="/Webspeek"
          element={loggedIn ? <WebSocket /> : <Navigate to="/" />}
        />
        <Route path="/files"
          element={loggedIn ? <FilePage /> : <Navigate to="/" />} // 新增路由
        />
        <Route path="/Record"
          element={loggedIn ? <Record /> : <Navigate to="/" />}
        />
        <Route path="*"
          element={loggedIn ? <Navigate to="/Webspeek" /> : <Navigate to="/" />}
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
