// WebSocket.js
import React, { useEffect, useRef, useState } from "react";
import "./WebSocket.css";
import Recorder from "./Recorder";

function Webspeek() {
  const [dtwResult, setDtwResult] = useState(null);
  const ws = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:8765");
    ws.current.onopen = () => {
      console.log("WebSocket 連線成功 (Webspeek)");
    };
    ws.current.onmessage = (event) => {
      if (typeof event.data === "string") {
        try {
          const data = JSON.parse(event.data);
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

    return () => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.close();
      }
    };
  }, []);

  // SafeSend
  const safeSend = (data) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(data);
    } else {
      console.error("❌ WebSocket 未開啟，無法發送訊息");
    }
  };

  return (
    <div className="container">
      <h1>語音評級</h1>

      <Recorder safeSend={safeSend} />

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
