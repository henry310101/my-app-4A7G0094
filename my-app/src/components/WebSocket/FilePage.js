// src/components/WebSocket/FilePage.js
import React, { useState, useEffect, useRef, useContext } from "react";
import "./FilePage.css"; // 匯入統一的 CSS
import { UserContext } from "../../App";


function FilePage() {
  // === State ===
  const [audioFiles, setAudioFiles] = useState([]); // 音檔列表
  const [audioSrc, setAudioSrc] = useState(null);   // 播放音檔
  const [wsError, setWsError] = useState(null);     // WebSocket 錯誤訊息
  const ws = useRef(null);
  const { userId } = useContext(UserContext); // 取得 user_id
  console.log("userId：", userId);
  // === WebSocket ===
  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:8765");
    ws.current.onopen = () => {
      console.log("WebSocket 連線成功 (FilePage)");
      requestFileList(); // 一開啟就請求音檔列表
    };
    ws.current.onmessage = (event) => {
      if (typeof event.data === "string") {
        try {
          const data = JSON.parse(event.data);
          console.log("📡 收到訊息:", data);
          // 若是陣列 => 音檔列表
          if (Array.isArray(data)) {
            console.log("音檔列表:", data);
            
            setAudioFiles(data);
          } 
          // 你可在此處處理其他 JSON 資料，例如錯誤訊息...
        } catch (err) {
          console.warn("JSON 解析失敗:", err);
        }
      } else {
        // 二進位 => 播放音檔
        const blob = new Blob([event.data], { type: "audio/wav" });
        setAudioSrc(URL.createObjectURL(blob));
      }
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

  // === 請求音檔列表 ===
  const requestFileList = () => {
    safeSend(JSON.stringify({ request: "file_list" }));
  };

  // === 請求播放某檔音檔 ===
  const requestFile = (filename) => {
    console.log("請求播放音檔:", filename);
    safeSend(JSON.stringify({ request_file: filename }));
  };

  // === 畫面 ===
  return (
    <div className="file-page-container">
      {/* 顯示錯誤訊息，如果wsError錯誤內容，才會顯示 */}
      {wsError && <p className="error-text">WebSocket 錯誤: {wsError}</p>} 
      {/* 播放音檔 */}
      {audioSrc && (
        <div className="audio-player">
          <audio controls src={audioSrc}></audio>
        </div>
      )}

      {/* 音檔列表 */}
      <div className="file-list">
        {audioFiles.length === 0 ? (
          <p>目前沒有音檔</p>
        ) : (
          <ul>
            {audioFiles.map((filename, idx) => (
              <li key={idx}>
                <span>{filename}</span>
                <button onClick={() => requestFile(filename)}>播放</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default FilePage;
