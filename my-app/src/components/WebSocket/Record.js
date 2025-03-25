import React, {useEffect, useRef, useContext}from "react";
import "./Record.css";
import { UserContext } from "../../App";

const Record = () => {
    const { userId } = useContext(UserContext); // 取得 user_id
    const ws = useRef(null);
    ws.current = new WebSocket("ws://localhost:8765");
    const requestRecord = () => {

    }
    useEffect(() => {
        ws.current.onopen = () => {
            console.log("WebSocket 連線成功 (Record)");
            requestRecord(); // 一開啟就請求音檔列表
          };
    }, []);
    
    return (
        <div className="Record-container">
            <h1>歷史紀錄</h1>
            <li>123</li>
            <li>123</li>
           
        </div>
    );
}
export default Record;