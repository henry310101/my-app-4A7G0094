// src/components/WebSocket/Auth.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css"; // 匯入同一份 CSS

function Auth({ loggedIn, onLogin, onLogout }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // 登入邏輯
  const handleLogin = () => {
    if (username === "1234" && password === "1234") {
      onLogin();            // 通知父元件 (App.js) => setLoggedIn(true)
      navigate("/Homepage"); // 導向下一個頁面
    } else {
      setError("帳號或密碼錯誤！請再試一次");
    }
  };

  // 登出邏輯
  const handleLogout = () => {
    onLogout();   // 通知父元件 (App.js) => setLoggedIn(false)
    navigate("/"); // 返回首頁 (或登入頁)
  };

  // 根據 `loggedIn` 顯示不同畫面
  if (loggedIn) {
    return (
      <div className="auth-container">
        <h2>登出</h2>
        <button className="auth-button" onClick={handleLogout}>
          登出
        </button>
      </div>
    );
  } else {
    return (
      <div className="auth-container">
        <h2>登入</h2>
        {error && <p className="error-message">{error}</p>}

        <div className="input-group">
          <label>帳號：</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="輸入帳號"
          />
        </div>

        <div className="input-group">
          <label>密碼：</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="輸入密碼"
          />
        </div>

        <button className="auth-button" onClick={handleLogin}>
          登入
        </button>
      </div>
    );
  }
}

export default Auth;
