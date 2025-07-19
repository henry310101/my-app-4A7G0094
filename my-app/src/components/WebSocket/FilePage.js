// File: src/components/FilePage/FilePage.js

import React, { useState, useEffect, useRef, useContext } from "react";
import "./FilePage.css";
import { UserContext } from "../../App";
import playerImage from "../images/play.png";

function FilePage() {
  // === State ===
  const [audioFiles, setAudioFiles] = useState([]);
  const [wsError, setWsError] = useState(null);
  const ws = useRef(null);
  const { userId } = useContext(UserContext);
  const audioRef = useRef(null);

  // === 顯示標題 & 分組容器 ===
  const Titles = { S: "短母音", L: "長母音", D: "雙母音", O: "其他" };
  const grouped = { S: [], L: [], D: [], O: [] };

  // === WebSocket 建立 & 處理 ===
  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:8765");
    ws.current.onopen = () => {
      console.log("WebSocket 連線成功 (FilePage)");
      requestFileList();
    };
    ws.current.onmessage = (event) => {
      if (typeof event.data === "string") {
        try {
          const data = JSON.parse(event.data);
          if (Array.isArray(data)) {
            setAudioFiles(data);
          }
        } catch (err) {
          console.warn("JSON 解析失敗:", err);
        }
      } else {
        const blob = new Blob([event.data], { type: "audio/wav" });
        audioRef.current.src = URL.createObjectURL(blob);
        audioRef.current.play();
      }
    };
    ws.current.onerror = (err) => {
      console.error("WebSocket 錯誤 (FilePage):", err);
      setWsError(err.toString());
    };
    ws.current.onclose = () => {
      console.log("WebSocket 已關閉 (FilePage)");
    };
    return () => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) ws.current.close();
    };
  }, []);

  const safeSend = (data) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(data);
    }
  };
  const requestFileList = () => {
    safeSend(JSON.stringify({ request: "file_list" }));
  };
  const requestFile = (filename) => {
    safeSend(JSON.stringify({ request: "filename", filename }));
  };

  // === 分組 & 排序邏輯 ===
  audioFiles.forEach((fn) => {
    const prefix = fn.charAt(0).toUpperCase();
    if (prefix === "S" || prefix === "L" || prefix === "D") {
      grouped[prefix].push(fn);
    } else {
      grouped.O.push(fn);
    }
  });
  // 根據顯示名稱排序
  Object.keys(grouped).forEach((key) => {
    grouped[key].sort((a, b) => {
      const nameA = a.replace(/^.*?_/, "").replace(/\.wav$/, "");
      const nameB = b.replace(/^.*?_/, "").replace(/\.wav$/, "");
      return nameA.localeCompare(nameB, undefined, { sensitivity: 'base' });
    });
  });

  // === Render ===
  return (
    <div className="file-page-container">
      {wsError && <p className="error-text">WebSocket 錯誤: {wsError}</p>}
      <audio ref={audioRef} style={{ display: 'none' }} />
      <div className="vowel-groups">
        {["S", "L", "D", "O"].map((prefix) => (
          <div className="vowel-group" key={prefix}>
            <h3>{Titles[prefix]}</h3>
            {grouped[prefix].length === 0 ? (
              <p>無檔案</p>
            ) : (
              <table className="file-table">
                <thead>
                  <tr>
                    <th>檔名</th>
                    <th>播放</th>
                  </tr>
                </thead>
                <tbody>
                  {grouped[prefix].map((fn, idx) => (
                    <tr key={idx}>
                      <td>{fn.replace(/^.*?_/, "").replace(/\.wav$/, "")}</td>
                      <td>
                        <button
                          className="playimage"
                          onClick={() => requestFile(fn)}
                        >
                          <img src={playerImage} alt="播放音檔" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default FilePage;
