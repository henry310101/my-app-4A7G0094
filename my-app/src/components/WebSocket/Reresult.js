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
  // 後端回來的完整檔名陣列，轉成 {filename, key, label} 格式
  const [topics, setTopics] = useState([]);
  // 選中的題目物件 {filename, key, label}
  const [selectedTopic, setSelectedTopic] = useState(null);
  // 錄音控制
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  // 播放題目音檔或錄音結果
  const audioRef = useRef(null);
  // WebSocket
  const ws = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:8765");
    ws.current.onopen = () => {
      console.log("Webspeek WS open");
      requestFileList();
    };
    ws.current.onmessage = async (event) => {
      // --- 如果收到 binary blob，就當作音檔播放 ---
      if (event.data instanceof Blob) {
        const url = URL.createObjectURL(event.data);
        audioRef.current.src = url;
        audioRef.current.play();
        return;
      }

      // --- 否則 parse JSON ---
      let data;
      try {
        data = JSON.parse(event.data);
      } catch (e) {
        console.warn("WS JSON parse failed:", e);
        return;
      }

      // --- 如果是陣列，當成檔名列表 ---
      if (Array.isArray(data)) {
        const items = data
          .filter(f => f.toLowerCase().endsWith(".wav"))
          .map((fn) => {
            // 去掉 .wav
            const base = fn.replace(/\.wav$/i, "");
            // 拆掉前綴，取最後一段當 key
            const key = base.split("_").pop();
            return { filename: fn, key, label: key };
          })
          // 依 label 排序
          .sort((a, b) =>
            a.label.localeCompare(b.label, undefined, { sensitivity: "base" })
          );
        setTopics(items);
        // 如果還沒選，就預設第一個
        if (!selectedTopic && items.length > 0) {
          setSelectedTopic(items[0]);
        }
        return;
      }

      // --- 如果帶有 image_data，就當 DTW 結果 ---
      if (data.image_data) {
        setDtwResult(data);
      }
    };
    ws.current.onerror = (err) => console.error("Webspeek WS error:", err);
    ws.current.onclose = () => console.log("Webspeek WS closed");
    return () => {
      ws.current?.readyState === WebSocket.OPEN && ws.current.close();
    };
  }, [selectedTopic]);

  // 安全發送
  const safeSend = (msg) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(msg);
    }
  };
  const requestFileList = () => {
    safeSend(JSON.stringify({ request: "file_list" }));
  };
  // 播放題目用
  const requestPrompt = () => {
    if (!selectedTopic) return;
    safeSend(
      JSON.stringify({ request: "filename", filename: selectedTopic.filename })
    );
  };

  // 錄音流程
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      const chunks = [];
      mr.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data);
      mr.onstop = async () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const arrayBuffer = await blob.arrayBuffer();
        const base64 = arrayBufferToBase64(arrayBuffer);
        // 上傳給後端，比對 DTW，用 key
        safeSend(
          JSON.stringify({
            request: "audioBase64",
            userId,
            ref: selectedTopic.key,
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
  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  // 檔案上傳流程
  const handleFileSelect = (e) => {
    e.target.files?.[0] && setSelectedFile(e.target.files[0]);
  };
  const handleFileUpload = () => {
    if (!selectedFile) return console.warn("未選擇檔案");
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataURL = e.target.result;
      const base64 = dataURL.split(",")[1];
      safeSend(
        JSON.stringify({
          request: "audioBase64",
          userId,
          ref: selectedTopic.key,
          audioBase64: base64,
        })
      );
    };
    reader.readAsDataURL(selectedFile);
  };

  /*
  const getGrade = (score) => {
    if (score >= 90) return "A+";
    if (score >= 85) return "A";
    if (score >= 80) return "A-";
    if (score >= 77) return "B+";
    if (score >= 73) return "B";
    if (score >= 70) return "B-";
    if (score >= 67) return "C+";
    if (score >= 63) return "C";
    if (score >= 60) return "C-";
  };
*/
  return (
    <div className="container">
      <h1>發音評級</h1>

      {/* 題目下拉 + 播放 */}
      <div
        style={{ marginBottom: "1rem", display: "flex", alignItems: "center" }}
      >
        <label>選擇題目：</label>
        <select
          value={selectedTopic?.filename || ""}
          onChange={(e) =>
            setSelectedTopic(
              topics.find((t) => t.filename === e.target.value) || null
            )
          }
          style={{ margin: "0 0.5rem" }}
        >
          {topics.length === 0 ? (
            <option disabled>載入中…</option>
          ) : (
            topics.map((t) => (
              <option key={t.filename} value={t.filename}>
                {t.label}
              </option>
            ))
          )}
        </select>
        <button onClick={requestPrompt}>播放題目</button>
      </div>

      {/* 錄音 & 上傳 Control */}
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

      {/* DTW 結果 */}
      {dtwResult && (
        <div className="dtw-result">
          <h3>DTW 比對結果</h3>
          <p>距離: {dtwResult.distance}</p>
          <p>
            得分: {dtwResult.score}
          </p>
          {dtwResult.image_data && (
            <img src={dtwResult.image_data} alt="DTW 路徑圖" />
          )}
        </div>
      )}

      {/* 隱藏的 audio 元素，用來播放題目或錄音 */}
      <audio ref={audioRef} style={{ display: "none" }} />
    </div>
  );
}

// 小工具：ArrayBuffer → Base64
function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}
