import React, { useEffect, useRef, useContext, useState } from "react";
import "./Record.css";
import { UserContext } from "../../App";

const Record = () => {
  const { userId } = useContext(UserContext); // 取得 user_id
  const ws = useRef(null);
  const [recordList, setRecordList] = useState([]);

  useEffect(() => {
    // 在初始渲染時才建立一次 WebSocket
    ws.current = new WebSocket("ws://localhost:8765");

    // 連線成功後，請求音檔列表
    ws.current.onopen = () => {
      console.log("WebSocket 連線成功 (Record)");
      console.log("userId=%d", userId);
      requestRecord();
    };

    // 監聽來自後端的訊息
    ws.current.onmessage = (event) => {
      if (typeof event.data === "string") {
        const data = JSON.parse(event.data);
        console.log("📡 收到訊息:", data);

        // 如果後端有回傳 { type: 'record', records: [...] }
        if (data.type === "record") {
          setRecordList(data.records || []);
          console.log("✅ recordList 更新了：", data.records);
        }
      }
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  // 向後端請求紀錄列表
  const requestRecord = () => {
    safeSend(JSON.stringify({ request: "record", userId }));
  };

  // 安全送出訊息
  const safeSend = (data) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(data);
    } else {
      console.error("❌ WebSocket 未開啟，無法發送訊息");
    }
  };

  return (
    <div className="Record_container">
      <h1>Record List</h1>
      {recordList.length === 0 ? (
        <p>目前尚無記錄</p>
      ) : (
        <table className="record-table">
          <thead>
            <tr>
              <th>上傳檔案</th>
              <th>最佳比對</th>
              <th>分數</th>
              <th>距離</th>
              <th>上傳時間</th>
            </tr>
          </thead>
          <tbody>
            {recordList.map((record, index) => (
              <tr key={index}>
                <td>{record.uploaded_file}</td>
                <td>{record.best_match}</td>
                <td>{record.score}</td>
                <td>{record.distance}</td>
                <td>{record.comparison_time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Record;
