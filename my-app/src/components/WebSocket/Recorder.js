import React, { useState, useRef, useContext } from "react";
import { UserContext } from "../../App";

// 把 ArrayBuffer 轉成 Base64 的小工具函式
function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  // btoa 可以把原生的 binary 字串轉成 Base64
  return btoa(binary);
}

function Recorder({ safeSend }) {
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const { userId } = useContext(UserContext);

  // 開始錄音
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      const chunks = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: "audio/webm" });
        const arrayBuffer = await audioBlob.arrayBuffer();
        const audioBase64 = arrayBufferToBase64(arrayBuffer);

        const message = {
          request: "audioBase64",
          userId: userId,
          audioBase64: audioBase64,
        };

        // 把整個 message 轉成字串後，送給 safeSend
        safeSend(JSON.stringify(message));
        console.log("✅ 錄音已發送 (Base64)");
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      console.error("❌ 錄音錯誤:", err);
    }
  };

  // 停止錄音
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  return (
    <div>
      <button onClick={recording ? stopRecording : startRecording}>
        {recording ? "停止錄音" : "開始錄音"}
      </button>
    </div>
  );
}

export default Recorder;
