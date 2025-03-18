import React, { createContext, useContext, useState } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import './App.css';
import Auth from "./components/WebSocket/Auth";
import Homepage from "./components/WebSocket/Homepage";
import WebSocket from './components/WebSocket/WebSocket';
import Navbar from "./components/WebSocket/Navbar";
import FilePage from "./components/WebSocket/FilePage";
import Record from "./components/WebSocket/Record";
import Register from "./components/WebSocket/Register";

// 創建 Context
export const UserContext = createContext();

const App = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null); // 存 user_id

  const handleLogin = (id) => {
    setLoggedIn(true);
    setUserId(id);  // 設定 user_id
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setUserId(null);  // 清除 user_id
  };

  return (
    <UserContext.Provider value={{ userId, setUserId }}>
      <BrowserRouter>
        {loggedIn && <Navbar onLogout={handleLogout} />}
        <Routes>
          <Route path="/"
            element={!loggedIn ? (
              <Auth onLogin={handleLogin} />
            ) : (
              <Navigate to="/Homepage" />
            )}
          />
          <Route path="/Homepage" element={loggedIn ? <Homepage /> : <Navigate to="/" />} />
          <Route path="/Webspeek" element={loggedIn ? <WebSocket /> : <Navigate to="/" />} />
          <Route path="/files" element={loggedIn ? <FilePage /> : <Navigate to="/" />} />
          <Route path="/Record" element={loggedIn ? <Record /> : <Navigate to="/" />} />
          <Route path="/Register" element={!loggedIn ? <Register /> : <Navigate to="/" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </UserContext.Provider>
  );
};

export default App;
