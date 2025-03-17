// src/components/WebSocket/Auth.js
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

function Auth({ loggedIn, onLogin, onLogout }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const ws = useRef(null);

  // 連結 WebSocket
  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:8765");

    ws.current.onopen = () => {
      console.log("WebSocket 連線成功 (Webspeek)");
    };

    ws.current.onmessage = (event) => {
      // 接收到後端傳來的訊息
      try {
        const data = JSON.parse(event.data);
        if (data.type === "login_response") {
          if (data.login_status === "success") {
            // 登入成功
            console.log(data.message); // 後端的提示訊息
            onLogin();                 // 通知父元件 => setLoggedIn(true)
            navigate("/Homepage");     // 導向成功後的頁面
          } else {
            // 登入失敗
            console.error(data.message);
            setError("帳號或密碼錯誤");
          }
        }
      } catch (err) {
        console.error("解析訊息時發生錯誤:", err);
      }
    };

    ws.current.onerror = (err) => {
      console.error("Webspeek 錯誤:", err);
    };

    ws.current.onclose = () => {
      console.log("Webspeek 已關閉");
    };

    return () => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.close();
      }
    };
  }, [onLogin, navigate]);

  // 封裝「安全發送」函式
  const safeSend = (data) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(data);
    } else {
      console.error("❌ WebSocket 未開啟，無法發送訊息");
    }
  };

  // 登入邏輯：僅把帳密送後端，等後端回應
  const handleLogin = () => {
    setError(""); // 清空先前的錯誤
    safeSend(
      JSON.stringify({
        request: "usename_password",
        username,
        password
      })
    );
    // 交給後端 SQL 去驗證
  };

  // 登出邏輯
  const handleLogout = () => {
    onLogout();   // 通知父元件 => setLoggedIn(false)
    navigate("/"); // 返回首頁 (或登入頁)
  };

  // 註冊頁面
  const handleRegister = () => {
    navigate("/Register");
  }

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
        <div className="input-group">
          <label>帳號：</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Account"
          />
        </div>

        <div className="input-group">
          <label>密碼：</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
        </div>
        <table>
          <tr>
            <td>{error && <p className="error-message">{error}</p>}</td>
            <td><button className="auth-button1" onClick={handleRegister}>
              註冊
            </button>
            </td>
            <td>
            <button className="auth-button" onClick={handleLogin}>
              登入
            </button>
            </td>
          </tr>
        </table>
      </div>
    );
  }
}

export default Auth;
