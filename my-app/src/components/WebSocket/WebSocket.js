// Webspeek.js
import React, { useEffect, useRef, useState, useContext } from "react";
import { UserContext } from "../../App"; // 若有用到 userId，就留著

function Webspeek() {
  const { userId } = useContext(UserContext);
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const [dtwResult, setDtwResult] = useState(null);
  const ws = useRef(null);

  // ★ 建立 WebSocket 連線
  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:8765");
    ws.current.onopen = () => {
      console.log("WebSocket 連線成功 (Webspeek)");
    };

    ws.current.onmessage = (event) => {
      // 伺服器回傳的資料若是文字類型，嘗試解析 JSON
      if (typeof event.data === "string") {
        try {
          const data = JSON.parse(event.data);
          // 有 image_data 就更新 DTW 結果
          if (data.image_data) {
            setDtwResult(data);
          }
        } catch (e) {
          console.warn("JSON 解析失敗:", e);
        }
      }
    };

    ws.current.onerror = (err) => {
      console.error("Webspeek 錯誤:", err);
    };

    ws.current.onclose = () => {
      console.log("Webspeek 已關閉");
    };

    // 離開頁面或元件卸載時，若連線還開著則關閉
    return () => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.close();
      }
    };
  }, []);

  // ★ 封裝安全送出訊息的函式
  //   - 可依伺服器需求來做 JSON 包裝或二進位傳送
  const safeSend = (audioData, userId) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      // 1) 如果伺服器需要純二進位：
      // ws.current.send(audioData);

      // 2) 如果伺服器需要 JSON (同時傳送 userId & 音訊):
      const message = {
        userId: userId,
        audio: Array.from(audioData), // 或者做 Base64 編碼
      };
      ws.current.send(JSON.stringify(message));

      console.log("✅ 錄音已發送");
    } else {
      console.error("❌ WebSocket 未開啟，無法發送訊息");
    }
  };

  // ★ 開始錄音
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
        const uint8Array = new Uint8Array(arrayBuffer);

        console.log("userID:", userId);
        safeSend(uint8Array, userId);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      console.error("❌ 錄音錯誤:", err);
    }
  };

  // ★ 停止錄音
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  return (
    <div className="container">
      <h1>語音評級</h1>

      {/* 錄音按鈕 */}
      <button onClick={recording ? stopRecording : startRecording}>
        {recording ? "停止錄音" : "開始錄音"}
      </button>

      {/* 顯示 DTW 結果 */}
      {dtwResult && (
        <div className="dtw-result">
          <h3>DTW 比對結果</h3>
          <p>最相近檔案: {dtwResult.best_match}</p>
          <p>距離: {dtwResult.distance}</p>
          <p>得分: {dtwResult.score}</p>
          {dtwResult.image_data && (
            <img
              src={dtwResult.image_data}
              alt="DTW 路徑圖"
            />
          )}
        </div>
      )}
    </div>
  );
}

export default Webspeek;
