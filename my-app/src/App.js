import React from 'react';
import './App.css';
import MyRGBPanel from './components/MyRGBPanel/MyRGBPanel'
import MyCalculator from './components/MyCalculator/MyCalculator'
import entersound from './components/DTW/entersound'
import Tictactoe from './components/tic_tac_toe/Tictactoe'
import WebSocketAudioUpload from './components/DTW/entersound';
import AudioFileList from './components/WebSocket/AudioFileList';


function App() {
  return (
    <div className="App">
      <header className="App-header">
        <p>
          資工三甲 4A7G0094 朱紘緯
        </p>
        <AudioFileList />
      </header>
    </div>
  );
}

export default App;
