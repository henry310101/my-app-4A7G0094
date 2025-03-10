import React from "react";
import "./WebSocket.css"; // 匯入你的 CSS

function FileList({ audioFiles, requestFile }) {
  return (
    <div>
      <h3>檔案列表</h3>
      {/* 使用 <ul> 包裹整個列表 */}
      <ul className="file-list">
        {audioFiles.map((file, index) => (
          // 用 <li> 表示其中一個檔案
          <li key={index} className="file-item">
            {file}
            <button className="play-button" onClick={() => requestFile(file)}>
              <span className="icon-play">▶</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default FileList;
