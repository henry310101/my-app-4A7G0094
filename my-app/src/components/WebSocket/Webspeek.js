import React, { useState, useEffect, useRef } from "react";
import Recorder from "./Recorder";
import FileList from "./FileList";

function Webspeek() {
  const [audioFiles, setAudioFiles] = useState([]); // 音檔列表
  const [audioSrc, setAudioSrc] = useState(null);   // 播放音檔
  const [dtwResult, setDtwResult] = useState(null); // 這裡放 DTW 結果(含圖片等)
  const ws = useRef(null);

  // 安全傳訊息
  const safeSend = (data) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(data);
    } 
    else {
      console.error("❌ WebSocket 未開啟，無法發送訊息");
    }
  };

  // 請求音檔列表
  const requestFileList = () => {
    safeSend(JSON.stringify({ request: "file_list" }));
    console.log("請求音檔列表");
  };

  // 播放某檔案
  const requestFile = (filename) => {
    safeSend(JSON.stringify({ request_file: filename }));
    console.log(`請求播放音檔: ${filename}`);
  };
// ---------------------------------------------------------
  // 初始化 WebSocket
  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:8765");

    ws.current.onopen = () => {
      console.log("WebSocket 連線成功");
      requestFileList(); // 一連線就請求檔案列表
    };
// ---------------------------------------------------------
    ws.current.onmessage = (event) => {
      // 若是字串，嘗試解析為 JSON
      if (typeof event.data === "string") {
        try {
          const data = JSON.parse(event.data);
          console.log("📡 收到訊息:", data);
          // 如果是一個陣列 => 檔案列表
          if (Array.isArray(data)) {
            setAudioFiles(data);
            console.log("audioFiles = ",data)
          }
          // 如果有 image_data => DTW 結果
          else if (data.image_data) {
            console.log("🎨 收到 DTW 結果:", data);
            setDtwResult(data);
          }
        } 
        catch (e) {
          console.warn("不是 JSON 字串或 JSON 解析失敗:", e);
        }
      } 
      // 如果是二進位資料就當音檔處理
      else {  
        const blob = new Blob([event.data], { type: "audio/wav" });
        //console.log(blob);
        setAudioSrc(URL.createObjectURL(blob));
        console.log("audioSrc = ",audioSrc)
      }
    };

    ws.current.onerror = (err) => {
      console.error("WebSocket 錯誤:", err);
    };

    ws.current.onclose = () => {
      console.log("WebSocket 已關閉");
    };

    return () => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.close();
      }
    };
  }, []);

  return (
    <div style={{ padding: "1rem" }}>
      <h2>WebSocket + 錄音 Demo</h2>

      {/* 錄音功能 */}
      <Recorder safeSend={safeSend} />

      {/* 播放音檔 */}
      {audioSrc && (
        <>
          <h3>音檔播放</h3>
          <audio controls src={audioSrc}></audio>
        </>
      )}

      {/* 檔案列表 */}
      <FileList audioFiles={audioFiles} requestFile={requestFile} />

      {/* 顯示 DTW 結果與圖表 */}
      {dtwResult && (
        <div style={{ border: "1px solid #ccc", marginTop: "1rem", padding: "1rem" }}>
          <h3>DTW 比對結果</h3>
          <p>最相近檔案: {dtwResult.best_match}</p>
          <p>距離: {dtwResult.distance}</p>
          <p>得分: {dtwResult.score}</p>
          {dtwResult.image_data && (
            <img
              src={dtwResult.image_data}
              alt="DTW 路徑圖"
              style={{ maxWidth: "400px", display: "block", marginTop: "1rem" }}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default Webspeek;
