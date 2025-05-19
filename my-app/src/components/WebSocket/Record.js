import React, { useEffect, useRef, useContext, useState } from "react";
import "./Record.css";
import { UserContext } from "../../App";
import {Chart,BarController,BarElement,LineController,LineElement,PointElement,CategoryScale,LinearScale,Tooltip,Title,Legend} from "chart.js";
import playerImage from '../images/play.png';
Chart.register(BarController,BarElement,CategoryScale,LinearScale,LineController,LineElement,PointElement,Tooltip,Title,Legend);


const Record = () => {
  const { userId } = useContext(UserContext);
  const ws = useRef(null);
  const chartRef = useRef(null);
  const chartInstance = useRef(null); // Chart 實例
  const [recordList, setRecordList] = useState([]);
  const audioRef = useRef(null);

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
      } else {
        // 二進位資料 -> 播放
        const blob = new Blob([event.data], { type: "audio/wav" });
        const url  = URL.createObjectURL(blob);
        audioRef.current.src = url;
        audioRef.current.play();
      }
    };

    return () => {
      ws.current?.close();
    };
  }, []);

  const playRecord = (record) => {
    console.log("播放錄音:", record.comparison_time);
    safeSend(JSON.stringify({
      request: "play_record",
      userId,
      comparison_time: record.comparison_time
    }));
  };

  useEffect(() => {
    if (!chartRef.current) return;
    if (recordList.length === 0) return;
  
    // 1) 分組統計：最高分 & 次數
    const stats = recordList.reduce((acc, { uploaded_file, score }) => {
      if (!acc[uploaded_file]) {
        acc[uploaded_file] = { maxScore: score, count: 1 };
      } else {
        acc[uploaded_file].maxScore = Math.max(acc[uploaded_file].maxScore, score);
        acc[uploaded_file].count += 1;
      }
      return acc;
    }, {});
  
    // 2) 拆出 labels, maxScores, counts
    const labels = Object.keys(stats);
    const maxScores = labels.map((word) => stats[word].maxScore);
    const counts    = labels.map((word) => stats[word].count);
  
    // 3) 準備 data & config
    const data = {
      labels,
      datasets: [
        {
          type: 'line',
          label: '練習次數',
          data: counts,
          fill: false,
          tension: 0.01,
          borderColor: '#e94e77',
        },
        
        {
          type: 'bar',
          label: '最高分數',
          data: maxScores,
          backgroundColor: '#4a90e2',
          borderRadius: 5,
        },
      ],
    };
  
    const config = {
      type: 'bar',  
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: 0
        },
        plugins: {
          title: { display: true, text: '最高分數 & 練習次數' },
          legend: { position: 'top' },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: '最高分數' },
          },
        },
      },
    };
  
    // 4) 銷毀舊圖 & 建立新圖
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
      <div className="chart-wrapper">
        <canvas ref={chartRef} />
      </div>
      <audio ref={audioRef} style={{ display: "none" }} />
      {/* 表格顯示 */}
      {recordList.length === 0 ? (
        <p>目前尚無記錄</p>
      ) : (
        <div className="table-card">
          <table className="record-table">
            <thead>
              <tr>
                <th>檢測題目</th>
                <th>分數</th>
                <th>距離</th>
                <th>上傳時間</th>
                <th>音檔</th>
              </tr>
            </thead>
            <tbody>
              {[...recordList].reverse().map((record, index) => (
                <tr key={index}>
                  <td>{record.uploaded_file}</td>
                  <td>{record.score}</td>
                  <td>{record.distance}</td>
                  <td>{record.comparison_time}</td>
                  <td>
                    <button className="playimgage" onClick={() => playRecord(record)}>
                      <img
                          src={playerImage}
                          alt="播放音檔"
                      />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Record;
