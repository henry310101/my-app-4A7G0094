// src/WebSocketAudioUpload.js
import React, { useState, useEffect } from 'react';

function WebSocketAudioUpload() {
    const [socket, setSocket] = useState(null);
    const [message, setMessage] = useState("");

    useEffect(() => {
        // 建立 WebSocket 連接
        const ws = new WebSocket('ws://localhost:8000');

        ws.onopen = () => {
            console.log('Connected to WebSocket server');
        };

        ws.onmessage = (event) => {
            console.log('Message from server:', event.data);
            setMessage(event.data); // 更新收到的消息
        };

        ws.onclose = () => {
            console.log("WebSocket connection closed");
        };

        ws.onerror = (error) => {
            console.log("WebSocket error:", error);
        };

        // 保存 WebSocket 連接到狀態
        setSocket(ws);

        // 清理 WebSocket 連接
        return () => {
            ws.close();
        };
    }, []); // 空依賴數組確保 useEffect 只執行一次

    const sendAudio = async () => {
        const fileInput = document.getElementById('audioInput');
        const file = fileInput.files[0];

        if (file && socket) {
            const reader = new FileReader();
            reader.onload = () => {
                const base64Audio = reader.result.split(',')[1];
                socket.send(base64Audio); // 發送 Base64 編碼的音訊數據到 WebSocket 服務器
                console.log("Audio file sent to server.");
            };
            reader.readAsDataURL(file); // 讀取並轉換為 Base64 格式
        } else {
            alert("Please select an audio file first");
        }
    };

    return (
        <div>
            <h2>WebSocket Audio Upload</h2>
            <input type="file" id="audioInput" accept="audio/*" />
            <button onClick={sendAudio}>Send Audio</button>
            {message && <p>Message from server: {message}</p>}
        </div>
    );
}

export default WebSocketAudioUpload;
