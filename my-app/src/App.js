import React, { useState } from "react";
import './App.css';
import Webspeek from './components/WebSocket/Webspeek';
import Login from "./components/WebSocket/Login";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  const handleLogin = () => {
    setLoggedIn(true);
  };

  return (
    <div className="App">
      <header className="App-header">
          {loggedIn ? (
        // 如果已登入，顯示 Webspeek 畫面
        <Webspeek />
      ) : (
        // 否則顯示登入畫面
        <Login onLogin={handleLogin} />
      )}

      </header>
    </div>
  );
}

export default App;
