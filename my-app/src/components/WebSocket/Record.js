import React, { useEffect, useRef, useContext, useState } from "react";
import "./Record.css";
import { UserContext } from "../../App";
import { Chart, BarElement, BarController,CategoryScale, LinearScale, Tooltip, Title, Legend } from "chart.js";

Chart.register(BarController,BarElement,CategoryScale,LinearScale,Tooltip,Title,Legend);

const Record = () => {
  const { userId } = useContext(UserContext);
  const ws = useRef(null);
  const chartRef = useRef(null);
  const chartInstance = useRef(null); // Chart 實例
  const [recordList, setRecordList] = useState([]);

  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:8765");

    ws.current.onopen = () => {
      console.log("WebSocket 連線成功 (Record)");
      requestRecord();
    };

    ws.current.onmessage = (event) => {
      if (typeof event.data === "string") {
          const data = JSON.parse(event.data);
          if (data.type === "record") {
            setRecordList(data.records || []);
          }
          console.log("收到訊息:", data);
      }
    };

    return () => {
      ws.current?.close();
    };
  }, []);

  useEffect(() => {
    if (recordList.length === 0 || !chartRef.current) return;

    const labels = recordList.map((r) => r.uploaded_file);
    const scores = recordList.map((r) => r.score);

    const data = {
      labels,
      datasets: [
        {
          label: "分數",
          data: scores,
          backgroundColor: "rgba(167, 206, 231, 0.7)",
          borderRadius: 5,
        },
      ],
    };

    const config = {
      type: "bar",
      data,
      options: {
        responsive: true,
        plugins: {
          legend: { position: "top" },
          title: {display: true, text: "評分紀錄"}
        },
        scales: {
          y: {beginAtZero: true, title: "分數" },
        }
      }
    };

    // 銷毀舊圖表
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    chartInstance.current = new Chart(chartRef.current, config);
  }, [recordList]);

  //送出資料
  const requestRecord = () => {
    safeSend(JSON.stringify({ request: "record", userId }));
  };

  //送出請求
  const safeSend = (data) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(data);
    } else {
      console.error("❌ WebSocket 未開啟，無法發送訊息");
    }
  };

  return (
    <div className="Record_container">
      <h1>紀錄</h1>

      {/* 圖表顯示 */}
      <div style={{ width: "100%", maxWidth: "900px", margin: "auto", paddingBottom: "30px" }}>
        <canvas ref={chartRef} />
      </div>

      {/* 表格顯示 */}
      {recordList.length === 0 ? (
        <p>目前尚無記錄</p>
      ) : (
        <table className="record-table">
          <thead>
            <tr>
              <th>檢測題目</th>
              <th>分數</th>
              <th>距離</th>
              <th>上傳時間</th>
            </tr>
          </thead>
          <tbody>
            {recordList.map((record, index) => (
              <tr key={index}>
                <td>{record.uploaded_file}</td>
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
