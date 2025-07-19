// File: src/components/Webspeek/Webspeek.js

import React, { useState, useEffect, useRef, useContext } from "react";
import { UserContext } from "../../App";
import "./Reresult.css";

export default function Webspeek() {
  const { userId } = useContext(UserContext);

  // DTW 結果
  const [dtwResult, setDtwResult] = useState(null);
  // 上傳用檔案
  const [selectedFile, setSelectedFile] = useState(null);
  // 從後端拿到的題目清單
  const [topicList, setTopicList] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState("");
  // 錄音控制
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);

  // WebSocket
  const ws = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:8765");

    ws.current.onopen = () => {
      console.log("Webspeek WS open");
      // 啟動後先向後端要一次檔案列表
      requestFileList();
    };

    ws.current.onmessage = (event) => {
      // 後端回傳一定是文字
      let data;
      try {
        data = JSON.parse(event.data);
      } catch (e) {
        console.warn("WS JSON parse failed:", e);
        return;
      }

      // 如果是陣列，就當成檔案列表來處理
      if (Array.isArray(data)) {
        // 去掉 .wav 後綴、去掉前綴，並按照 A-Z 排序
        const topics = data
          .map((fn) => fn.replace(/\.wav$/i, "").replace(/^.*?_/, ""))
          .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
        setTopicList(topics);
        // 若還沒選過預設，就自動選第一個
        if (!selectedTopic && topics.length > 0) {
          setSelectedTopic(topics[0]);
        }
        return;
      }

      // 否則若帶有 image_data，當做 DTW 結果
      if (data.image_data) {
        setDtwResult(data);
      }
    };

    ws.current.onerror = (err) => console.error("Webspeek WS error:", err);
    ws.current.onclose = () => console.log("Webspeek WS closed");

    return () => {
      // cleanup
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.close();
      }
    };
  }, [selectedTopic]);

  // 安全發送
  const safeSend = (msg) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(msg);
    }
  };

  const requestFileList = () => {
    safeSend(JSON.stringify({ request: "file_list" }));
  };

  // --- 錄音流程 ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      const chunks = [];

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      mr.onstop = async () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const arrayBuffer = await blob.arrayBuffer();
        const base64 = arrayBufferToBase64(arrayBuffer);

        // 發送給後端，帶上選定的題目
        safeSend(
          JSON.stringify({
            request: "audioBase64",
            userId,
            ref: selectedTopic,
            audioBase64: base64,
          })
        );
      };

      mediaRecorderRef.current = mr;
      mr.start();
      setRecording(true);
    } catch (err) {
      console.error("錄音錯誤:", err);
    }
  };

const getGrade = (score) => {
  if (score >= 90 && score <= 100) return "A+";
  else if (score >= 85 && score <= 89) return "A";
  else if (score >= 80 && score <= 84) return "A-";
  else if (score >= 77 && score <= 79) return "B+";
  else if (score >= 73 && score <= 76) return "B";
  else if (score >= 70 && score <= 72) return "B-";
  else if (score >= 67 && score <= 69) return "C+";
  else if (score >= 63 && score <= 66) return "C";
  else if (score >= 60 && score <= 62) return "C-";
  else if (score < 60) return "D";
};


  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  // 檔案上傳流程
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };
  const handleFileUpload = () => {
    if (!selectedFile) {
      console.warn("未選擇檔案");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataURL = e.target.result;
      const base64 = dataURL.split(",")[1];
      safeSend(
        JSON.stringify({
          request: "audioBase64",
          userId,
          ref: selectedTopic,
          audioBase64: base64,
        })
      );
    };
    reader.readAsDataURL(selectedFile);
  };

  return (
    <div className="container">
      <h1>發音評級</h1>

      {/* 動態產生題目下拉 */}
      <div style={{ marginBottom: "1rem" }}>
        <label>選擇題目：</label>
        <select
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
        >
          {topicList.length === 0 ? (
            <option disabled>載入中…</option>
          ) : (
            topicList.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))
          )}
        </select>
      </div>

      <div className="action-row">
        <button onClick={recording ? stopRecording : startRecording}>
          {recording ? "停止錄音" : "開始錄音"}
        </button>
        <button onClick={handleFileUpload}>上傳檔案</button>
        <input
          id="real-file"
          type="file"
          style={{ display: "none" }}
          onChange={handleFileSelect}
        />
        <label htmlFor="real-file" className="custom-file-upload">
          選擇檔案
        </label>
        <span style={{ marginLeft: 10, fontSize: 20 }}>
          {selectedFile ? selectedFile.name : "尚未選擇檔案"}
        </span>
      </div>

      {dtwResult && (
        <div className="dtw-result">
          <h3>DTW 比對結果</h3>
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

// 小工具：ArrayBuffer → Base64
function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
