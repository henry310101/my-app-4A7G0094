import React, { useState } from "react";
import "./WebSocket.css"; // 可選：用來美化畫面

function Login({ onLogin }) {
  const [username, setUsername] = useState(""); // 帳號狀態
  const [password, setPassword] = useState(""); // 密碼狀態
  const [error, setError] = useState(""); // 錯誤訊息

  // 當使用者輸入帳號時，更新狀態
  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  // 當使用者輸入密碼時，更新狀態
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  // 點擊登入按鈕時
  const handleLogin = () => {
    // 簡單驗證帳號 & 密碼
    if (username === "1234" && password === "1234") {
      onLogin(); // 觸發父元件的登入函式
    } else {
      setError("帳號或密碼錯誤！請再試一次");
    }
  };

  return (
    <div className="login-container">
      <h2>登入</h2>
      {error && <p className="error-message">{error}</p>} {/* 顯示錯誤訊息 */}
      
      <div className="input-group">
        <label>帳號：</label>
        <input
          type="text"
          value={username}
          onChange={handleUsernameChange}
          placeholder="輸入帳號"
        />
      </div>

      <div className="input-group">
        <label>密碼：</label>
        <input
          type="password"
          value={password}
          onChange={handlePasswordChange}
          placeholder="輸入密碼"
        />
      </div>

      <button className="login-button" onClick={handleLogin}>
        登入
      </button>
    </div>
  );
}

export default Login;
