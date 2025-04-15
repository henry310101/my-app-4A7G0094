// Webspeek.js
import React, { useState, useEffect, useRef } from "react";
import "./Reresult.css";

function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function Webspeek() {
  const [dtwResult, setDtwResult] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // 錄音相關 state & ref
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);

  const ws = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:8765");
    ws.current.onopen = () => {
      console.log("WebSocket 連線成功 (Webspeek)");
    };
    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.image_data) {
          setDtwResult(data);
        }
      } catch (e) {
        console.warn("JSON 解析失敗:", e);
      }
    };
    ws.current.onerror = (err) => console.error("Webspeek 錯誤:", err);
    ws.current.onclose = () => console.log("Webspeek 已關閉");

    return () => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.close();
      }
    };
  }, []);

  // 封裝 WebSocket 傳送
  const safeSend = (data) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(data);
    } else {
      console.error("❌ WebSocket 未開啟，無法發送訊息");
    }
  };

  // ===== 錄音功能 =====
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      const chunks = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: "audio/webm" });
        const arrayBuffer = await audioBlob.arrayBuffer();
        const audioBase64 = arrayBufferToBase64(arrayBuffer);
        const message = {
          request: "audioBase64",
          userId: "guestUser",
          audioBase64,
        };
        safeSend(JSON.stringify(message));
        console.log("✅ 錄音已發送 (Base64)");
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      console.error("❌ 錄音錯誤:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  // ===== 檔案上傳功能 =====
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleFileUpload = () => {
    if (!selectedFile) {
      console.warn("未選擇任何檔案");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataURL = event.target.result;
      const base64String = dataURL.split(",")[1];
      const message = {
        request: "audioBase64",
        userId: "guestUser",
        audioBase64: base64String,
      };
      safeSend(JSON.stringify(message));
    };
    reader.readAsDataURL(selectedFile);
  };

  return (
    <div className="container">
      <h1>語音評級</h1>

      {/* 同一行容器 */}
      <div className="action-row">
        {/* 錄音按鈕 */}
        <button onClick={recording ? stopRecording : startRecording}>
          {recording ? "停止錄音" : "開始錄音"}
        </button>

        {/* 上傳檔案 */}
        <button onClick={handleFileUpload}>上傳檔案</button>

        {/* 隱藏 input */}
        <input
          id="real-file"
          type="file"
          style={{ display: "none" }}
          onChange={handleFileSelect}
        />
        <label htmlFor="real-file" className="custom-file-upload">
          選擇檔案
        </label>
        <span style={{ marginLeft: "10px" }}>
         {selectedFile ? selectedFile.name : "尚未選擇檔案"}
        </span>

      </div>

      {dtwResult && (
        <div className="dtw-result">
          <h3>DTW 比對結果</h3>
          <p>最相近檔案: {dtwResult.best_match}</p>
          <p>距離: {dtwResult.distance}</p>
          <p>得分: {dtwResult.score}</p>
          {dtwResult.image_data && (
            <img src={dtwResult.image_data} alt="DTW 路徑圖" />
          )}
        </div>
      )}
    </div>
  );
}

export default Webspeek;
