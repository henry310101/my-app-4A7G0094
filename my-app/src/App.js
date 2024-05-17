
import './App.css';
import MyRGBPanel from './components/MyRGBPanel'
import MyCalculator from './components/MyCalculator'
import React from 'react';


function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>hello react! 20240509</h1>
        <h2>react第一個元件</h2>
        <p>
          資工三甲 4A7G0094 朱紘緯
        </p>
        <MyRGBPanel/>
        <p>react第二個元件</p>
        <h3>MyCalculator</h3>
        <MyCalculator/>

       
      </header>
    </div>
  );
}

export default App;
