// src/components/WebSocket/Auth.js
import React, { useState, useEffect, useRef, useContext  } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";
import { UserContext } from "../../App";

function Auth({ onLogin }) {
  // State Variables
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const ws = useRef(null);
  const { setUserId } = useContext(UserContext);

  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:8765");
    ws.current.onopen = () => {
      console.log("WebSocket 連線成功 (Webspeek)");
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("📡 收到訊息:", data);
        if (data.type === "login_response") {
          if (data.login_status === "success") {
            console.log(data.message); // 後端提示訊息
            alert("登入成功");
            onLogin();             // 通知父元件，更新登入狀態
            navigate("/Homepage"); // 導向首頁
            setUserId(data.user_id); // 設定 user_id
            onLogin(data.user_id);   // 傳 `user_id` 給 `App.js`
            
          } 
          else {
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

    // 清理 WebSocket 連線
    return () => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.close();
      }
    };
  }, [onLogin, navigate]);

  //送資料給後端
  const safeSend = (data) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(data);
    } else {
      console.error("❌ WebSocket 未開啟，無法發送訊息");
    }
  };
  // 處理登入：將帳號密碼發送給後端驗證
  const handleLogin = () => {
    setError(""); // 清空錯誤訊息
    safeSend(
      JSON.stringify({
        request: "usename_password",
        username,
        password,
      })
    );
  };

  // 導向註冊頁面
  const handleRegister = () => {
    navigate("/Register");
  };

  // Render: 登入表單
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
          <td>
            <button className="auth-button1" onClick={handleRegister}>
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

export default Auth;
