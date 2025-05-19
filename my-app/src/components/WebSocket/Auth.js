// src/components/WebSocket/Auth.js
import React, { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";
import { UserContext } from "../../App";

function Auth({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const ws = useRef(null);
  const { setUserId } = useContext(UserContext);

  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:8765");
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "login_response") {
        if (data.login_status === "success") {
          alert("登入成功");
          setUserId(data.user_id);
          onLogin(data.user_id);
          navigate("/Homepage");
        } else {
          setError("帳號或密碼錯誤");
        }
      }
    };
    return () => ws.current?.close();
  }, [onLogin, navigate, setUserId]);

  const safeSend = (msg) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(msg);
    }
  };

  const handleLogin = () => {
    setError("");
    safeSend(
      JSON.stringify({
        request: "usename_password",
        username,
        password,
      })
    );
  };

  return (
    <div className="auth-container">
      <h2>登入</h2>

      {error && <p className="error-message">{error}</p>}

      <div className="form-group">
        <label htmlFor="auth-username">帳號</label>
        <input
          id="auth-username"
          type="text"
          placeholder="Account"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="auth-password">密碼</label>
        <input
          id="auth-password"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div className="button-group">
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/Register")}
        >
          註冊
        </button>
        <button className="btn btn-primary" onClick={handleLogin}>
          登入
        </button>
      </div>
    </div>
  );
}

export default Auth;
