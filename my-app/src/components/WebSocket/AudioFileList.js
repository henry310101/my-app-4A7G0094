import React, { useEffect, useState } from 'react';

function AudioFileList() {
    const [audioFiles, setAudioFiles] = useState([]); // 音檔列表
    const [selectedFile, setSelectedFile] = useState(null); // 選中的文件
    const [audioSrc, setAudioSrc] = useState(null); // 播放音檔的來源
    const [ws, setWs] = useState(null); // WebSocket 連接
    const [uploading, setUploading] = useState(false); // 文件上傳狀態
    const [error, setError] = useState(null); // 錯誤訊息

    // 建立 WebSocket 連接，支援自動重連
    useEffect(() => {
        const connectWebSocket = () => {
            const websocket = new WebSocket(process.env.REACT_APP_WEBSOCKET_URL || 'ws://localhost:8000');
            setWs(websocket);

            websocket.onopen = () => {
                console.log('Connected to WebSocket server');
            };

            websocket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.audioData) {
                        // 收到音檔數據並設置為播放來源
                        const binaryString = atob(data.audioData);
                        const bytes = Uint8Array.from(binaryString, char => char.charCodeAt(0));
                        const audioBlob = new Blob([bytes], { type: data.mimeType || 'audio/wav' });
                        const audioUrl = URL.createObjectURL(audioBlob);
                        setAudioSrc(audioUrl);
                    } else if (Array.isArray(data)) {
                        setAudioFiles(data); // 更新音檔列表
                    } else if (data.error) {
                        setError(data.error); // 顯示錯誤信息
                    }
                } catch (e) {
                    setError("Error parsing server response.");
                }
            };

            websocket.onclose = () => {
                console.log('WebSocket connection closed, attempting to reconnect...');
                setTimeout(connectWebSocket, 5000); // 5秒後嘗試重新連接
            };

            websocket.onerror = (error) => {
                console.log('WebSocket error:', error);
            };
        };

        connectWebSocket();

        return () => {
            if (ws) ws.close();
        };
    }, []);

    // 上傳文件的函數
    const uploadFile = () => {
        if (!selectedFile) {
            alert("Please select an audio file to upload.");
            return;
        }
        setUploading(true);
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
            setUploading(false);
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
        <div style={{ fontFamily: 'Arial, sans-serif', margin: '20px' }}>
            <h3>上傳音檔</h3>
            <input 
                type="file" 
                accept="audio/*" 
                onChange={(e) => setSelectedFile(e.target.files[0])}
            />
            <button onClick={uploadFile} style={{ marginLeft: '10px' }}>上傳音檔</button>
            {uploading && <p>上傳中...</p>}
            
            {error && (
                <div style={{ color: 'red', marginTop: '10px' }}>
                    <p>{error}</p>
                    <button onClick={() => setError(null)} style={{ backgroundColor: 'lightgray', border: 'none', padding: '5px 10px', cursor: 'pointer' }}>
                        清除錯誤
                    </button>
                </div>
            )}

            {audioSrc && (
                <div style={{ marginTop: '20px' }}>
                    <h3>撥放音檔</h3>
                    <audio controls src={audioSrc}></audio>
                </div>
            )}

            <h2 style={{ marginTop: '30px' }}>資料夾內的音檔</h2>
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {audioFiles.map((file, index) => (
                    <li key={index} style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
                        <span style={{ flex: 1 }}>{file}</span>
                        <button 
                            onClick={() => requestFile(file)} 
                            style={{ marginLeft: '10px', padding: '5px 10px', cursor: 'pointer' }}>
                            撥放
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default AudioFileList;
