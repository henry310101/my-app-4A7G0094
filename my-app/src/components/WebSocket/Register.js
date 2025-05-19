import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const navigate = useNavigate();
  const ws = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:8765");

    ws.current.onopen = () => {
      console.log("✅ WebSocket 連線成功 (RegisterPage)");
    };

    ws.current.onmessage = (event) => {
      if (typeof event.data === "string") {
        try {
          const data = JSON.parse(event.data);
          console.log("📡 收到訊息:", data);

          if (data.type === "register_response") {
            if (data.status === "success") {
              setError("");
              alert("註冊成功！");
              // 清空表單
              setUsername("");
              setPassword("");
              setConfirmPassword("");
              navigate("/");

            } else if (data.status === "fail") {
              setError(data.message || "註冊失敗");
              setInfo("");
            }
          }
        } catch (err) {
          console.warn("JSON 解析失敗:", err);
        }
      }
    };

    ws.current.onerror = (err) => {
      console.error("WebSocket 錯誤 (RegisterPage):", err);
    };

    ws.current.onclose = () => {
      console.log("WebSocket 已關閉 (RegisterPage)");
    };

    return () => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.close();
      }
    };
  }, []);

  // 安全傳送訊息
  const safeSend = (data) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(data);
    } else {
      console.error("❌ WebSocket 未開啟，無法發送訊息");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("❗ 兩次密碼輸入不一致，請再試一次！");
      setInfo("");
      return;
    }
    setError("");
    safeSend(
      JSON.stringify({
        request: "register_account",
        username,
        password,
      })
    );
  };

  const onLogin = () => {
    navigate("/");
  };

  return (
    <div className="register-container">
      <h1>註冊</h1>

      {error && <p className="register-error">{error}</p>}
      {info && <p className="register-info">{info}</p>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">帳號</label>
          <input
            type="text"
            id="username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">密碼</label>
          <input
            type="password"
            id="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">確認密碼</label>
          <input
            type="password"
            id="confirmPassword"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <div className="button-group">
          <button type="submit" className="btn btn-primary">註冊</button>
          <button type="button" className="btn btn-secondary" onClick={onLogin}>返回</button>
        </div>
      </form>
    </div>
  );
}

export default Register;
