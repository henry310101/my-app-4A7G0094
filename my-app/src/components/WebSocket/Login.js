import React, { useState } from "react";
import { useNavigate } from "react-router-dom";  // ✅ 使用 React Router v6 的 useNavigate

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate(); // 🔹 獲取導向函式

  const handleLogin = () => {
    if (username === "1234" && password === "1234") {
      navigate("/Webspeek"); // ✅ 成功登入後跳轉到 Webspeek
    } else {
      setError("帳號或密碼錯誤！請再試一次");
    }
  };

  const handleHome = () => {
    navigate("/"); // ✅ 返回首頁
  }


  return (
    <div className="login-container">
      <h2>登入</h2>
      <ul>
      <button className="home-button" onClick={handleHome}>
        返回首頁
      </button>
      </ul>
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

      <button className="login-button" onClick={handleLogin}>
        登入
      </button>

    </div>
  );
}

export default Login;
