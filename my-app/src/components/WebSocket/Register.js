import React, { useState, useRef,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [wsError, setWsError] = useState(null);
  const navigate = useNavigate();
  const ws = useRef(null);

  useEffect(() => {
      ws.current = new WebSocket("ws://localhost:8765");
      ws.current.onopen = () => {
        console.log("WebSocket 連線成功 (FilePage)");
      };
      ws.current.onerror = (err) => {
        console.error("WebSocket 錯誤 (FilePage):", err);
        setWsError(err.toString());
      };
  
      ws.current.onclose = () => {
        console.log("WebSocket 已關閉 (FilePage)");
      };
  
      // 離開時關閉連線
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
        setError("兩次密碼輸入不一致，請再試一次！");
        setInfo("");
        return;
      }
      // 清空錯誤、顯示提示
      setError("");
      setInfo(`帳號：${username} 已提交註冊！`);
    
      // 直接呼叫 safeSend
      safeSend(JSON.stringify({
        request: "register_account",
        username,
        password
      }));
    
      // 也可以改成 alert/或做其他UI操作...
      navigate("/");
    
      // 成功後清空表單
      setUsername("");
      setPassword("");
      setConfirmPassword("");
    };

    const onlogin = () =>{
      navigate("/")
    }

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
            name="username"
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
            name="password"
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
            name="confirmPassword"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        <table>
          <tr>
            <td><button type="submit" >註冊</button></td>
            <td><button onClick={onlogin} >返回</button></td>
          </tr>
        </table>
        
      </form>
    </div>
  );
}

export default Register;
