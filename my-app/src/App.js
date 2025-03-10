import React from 'react';
import './App.css';
import Webspeek from './components/WebSocket/Webspeek';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <p>
          React 資工四甲 4A7G0094 朱紘緯
        </p>
        
       
        <Webspeek />
      </header>
    </div>
  );
}

export default App;
