import React, { useState, useEffect, useRef } from "react";

function AudioFileList() {
    const [audioFiles, setAudioFiles] = useState([]); // 音檔列表
    const [audioSrc, setAudioSrc] = useState(null); // 播放音檔的來源
    const [error, setError] = useState(null); // 錯誤訊息
    const [recording, setRecording] = useState(false); // 錄音狀態
    const ws = useRef(null); // WebSocket 引用

    // 初始化 WebSocket
    useEffect(() => {
        ws.current = new WebSocket('wss://2943-1-175-184-4.ngrok-free.app');

        ws.current.onopen = () => {
            console.log("WebSocket connection established");
        };

        ws.current.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (Array.isArray(data)) {
                    // 更新音檔列表
                    console.log("Updating audio file list:", data);
                    setAudioFiles(data);
                } else if (data.audioData) {
                    // 更新音檔播放來源
                    const binaryString = atob(data.audioData);
                    const bytes = Uint8Array.from(binaryString, (char) =>
                        char.charCodeAt(0)
                    );
                    const audioBlob = new Blob([bytes], {
                        type: data.mimeType || "audio/wav",
                    });
                    setAudioSrc(URL.createObjectURL(audioBlob));
                }
            } catch (e) {
                console.error("Error parsing WebSocket message:", e);
                setError("Error parsing server response");
            }
        };

        ws.current.onerror = (err) => {
            console.error("WebSocket error:", err);
            setError("WebSocket connection error.");
        };

        ws.current.onclose = () => {
            console.log("WebSocket connection closed");
        };

        return () => {
            if (ws.current && ws.current.readyState === WebSocket.OPEN) {
                ws.current.close();
            }
        };
    }, []);

    // 撥放請求
    const requestFile = (filename) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({ request_file: filename }));
            console.log(`Requested file: ${filename}`);
        } else {
            console.log("WebSocket is not open");
        }
    };

    // 錄音處理
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });
            const mediaRecorder = new MediaRecorder(stream);
            const chunks = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunks.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(chunks, { type: "audio/wav" });
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64Audio = reader.result.split(",")[1];
                    const data = {
                        filename: `recording_${Date.now()}`,
                        audioData: base64Audio,
                    };
                    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
                        ws.current.send(JSON.stringify(data));
                        console.log("Audio sent");
                    } else {
                        console.error("WebSocket is not open");
                    }
                };
                reader.readAsDataURL(audioBlob);
            };

            mediaRecorder.start();
            setRecording(true);

            // 停止錄音後處理
            setTimeout(() => {
                mediaRecorder.stop();
                setRecording(false);
            }, 3000); // 錄音 3 秒
        } catch (err) {
            console.error("Error starting recording:", err);
            setError("Unable to access microphone");
        }
    };

    const stopRecording = () => {
        setRecording(false);
    };

    // 錯誤清除
    const clearError = () => setError(null);

    return (
        <div className="audio-file-list">
            <div>
                <button onClick={recording ? stopRecording : startRecording}>
                    {recording ? "停止錄音" : "開始錄音"}
                </button>
            </div>
            {error && (
                <div className="error">
                    <p>{error}</p>
                    <button onClick={clearError}>清除錯誤</button>
                </div>
            )}
            {audioSrc && (
                <div className="audio-player">
                    <h3>撥放音檔</h3>
                    <audio controls src={audioSrc}></audio>
                </div>
            )}
            <div>
                <h2>音檔列表</h2>
                <ul>
                    {audioFiles.map((file, index) => (
                        <li key={index}>
                            <span>{file}</span>
                            <button onClick={() => requestFile(file)}>
                                撥放
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default AudioFileList;
