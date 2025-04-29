import React, { useState, useEffect, useRef, useContext } from "react";
import "./FilePage.css";
import { UserContext } from "../../App";
import playerImage from '../images/player.png';


function FilePage() {
  // === State ===
  const [audioFiles, setAudioFiles] = useState([]);
  const [wsError, setWsError] = useState(null);
  const ws = useRef(null);
  const { userId } = useContext(UserContext);
  const audioRef = useRef(null);

  // === WebSocket ===
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
          console.log("📡 收到訊息:", data);

          if (Array.isArray(data)) {
            setAudioFiles(data);
          }
        } catch (err) {
          console.warn("JSON 解析失敗:", err);
        }
      } else {
        const blob = new Blob([event.data], { type: "audio/wav" });
        const objectURL = URL.createObjectURL(blob);

        if (audioRef.current) {
          audioRef.current.src = objectURL;
          audioRef.current.play();
        }
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
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.close();
      }
    };
  }, []);

  const safeSend = (data) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(data);
    } else {
      console.error("❌ WebSocket 未開啟，無法發送訊息");
    }
  };

  const requestFileList = () => {
    safeSend(JSON.stringify({ request: "file_list" }));
  };

  const requestFile = (filename) => {
    console.log("請求播放音檔:", filename);
    safeSend(JSON.stringify({ 
      request: "filename" ,
      filename: filename 
    }));
  };

  // === 分組邏輯 ===
  const Titles = {
    a: "清音子音 + 母音",
    e: "濁音子音 + 母音",
    i: "子音 + 短母音",
    o: "子音 + 雙母音",
    u: "子音 + R 母音"
  };

  const vowelGroups = {
    a: [], e: [], i: [], o: [], u: []
  };

  audioFiles.forEach((filename) => {
    const firstChar = filename[0].toLowerCase();
    if (vowelGroups[firstChar]) {
      vowelGroups[firstChar].push(filename);
    }
  });

  return (
    <div className="file-page-container">
      {wsError && <p className="error-text">WebSocket 錯誤: {wsError}</p>}
      <audio ref={audioRef} />
      <h2>音檔列表</h2>

      <div className="vowel-groups">
        {Object.entries(vowelGroups).map(([vowel, files]) => (
          <div className="vowel-group" key={vowel}>
            <h3>{Titles[vowel]}</h3>
            {files.length === 0 ? (
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
                  {files.map((filename, idx) => (
                    <tr key={idx}>
                      <td>{filename.replace(/^.*?_/, '').replace(/\.wav$/, '')}</td>
                      <td>
                        <button onClick={() => requestFile(filename)}>
                          <img
                            src={playerImage}
                            className="player-image"
                            alt="播放音檔"
                          />
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
