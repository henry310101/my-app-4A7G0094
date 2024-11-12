// src/AudioFileList.js
import React, { useEffect, useState } from 'react';

function AudioFileList() {
    const [audioFiles, setAudioFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null); // 用於選中的文件
    const [audioSrc, setAudioSrc] = useState(null); // 用於播放音檔
    const [ws, setWs] = useState(null); // WebSocket 連接

    useEffect(() => {
        // 建立 WebSocket 連接
        const websocket = new WebSocket('ws://localhost:8000');
        setWs(websocket);

        websocket.onopen = () => {
            console.log('Connected to WebSocket server');
        };
        websocket.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.audioData) {
                // 如果收到的是音檔數據，解碼並設置為播放來源
                const binaryString = atob(data.audioData);
                const bytes = Uint8Array.from(binaryString, char => char.charCodeAt(0));
                const audioBlob = new Blob([bytes], { type: 'audio/wav' });
                const audioUrl = URL.createObjectURL(audioBlob);
                setAudioSrc(audioUrl);
            } else if (Array.isArray(data)) {
                setAudioFiles(data); // 更新音檔列表
            } else if (data.error) {
                console.error(data.error);
                alert(data.error); // 顯示錯誤信息
            }
        };
        websocket.onclose = () => {
            console.log('WebSocket connection closed');
        };
        websocket.onerror = (error) => {
            console.log('WebSocket error:', error);
        };
        // 清理 WebSocket 連接
        return () => {
            websocket.close();
        };
    }, []);

    // 上傳文件的函數
    const uploadFile = () => {
        if (!selectedFile) {
            alert("Please select an audio file to upload.");
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            const base64Audio = reader.result.split(',')[1];
            const data = {
                filename: selectedFile.name.replace(/\.[^/.]+$/, ""), // 去除副檔名
                audioData: base64Audio, // 編碼後的音訊數據
            };
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify(data));
                console.log("File sent to server");
            } else {
                console.log("WebSocket connection is not open");
            }
        };
        reader.readAsDataURL(selectedFile); // 讀取文件並轉換為 Base64
    };

    // 請求指定音檔的函數
    const requestFile = (filename) => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ request_file: filename }));
            console.log(`Requested file: ${filename}`);
        } else {
            console.log('WebSocket is not open');
        }
    };

    return (
        <div>
            <h3>上傳音檔</h3>
            <input 
                type="file" 
                accept="audio/*" 
                onChange={(e) => setSelectedFile(e.target.files[0])}
            />
            <button onClick={uploadFile}>上傳音檔</button>
            {audioSrc && (
                <div>
                    <h3>撥放音檔</h3>
                    <audio controls src={audioSrc}></audio>
                </div>
            )}
            <h2>資料夾內的音檔</h2>
            <ul>
                {audioFiles.map((file, index) => (
                    <li key={index}>
                        {file} <button onClick={() => requestFile(file)}>撥放</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default AudioFileList;
