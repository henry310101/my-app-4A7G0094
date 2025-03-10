import React from "react";

function FileList({ audioFiles, requestFile }) {
  return (
    <div>
      <h3>檔案列表</h3>
      <ul>
        {audioFiles.map((file, index) => (
          <li key={index}>
            {file}
            <button onClick={() => requestFile(file)}> 播放 </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default FileList;
