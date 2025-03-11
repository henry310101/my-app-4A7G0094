import React from "react";
import "./Homepage.css"; 

const Homepage = () => {
  return (
    <div className="homepage-container">
      <h1>歡迎來到我的應用程式</h1>
      <p>
        這個程式使用了 WebSocket 連線與 React 前端，
        能夠即時錄音與播放音檔，並進行語音比對與分析。 
        同時，我們也實作了登入、登出以及檔案列表等功能。
      </p>
      <p>
        透過導覽列，您可以前往 <strong>Webspeek</strong> 頁面進行語音錄製與比對，
        或前往 <strong>FilePage</strong> 管理您的音檔。
      </p>
      <p>請點擊上方的「登入」按鈕或功能列開始使用！</p>
    </div>
  );
};

export default Homepage;
