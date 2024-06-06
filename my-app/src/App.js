import React from 'react';
import './App.css';
import MyRGBPanel from './components/MyRGBPanel/MyRGBPanel'
import MyCalculator from './components/MyCalculator/MyCalculator'

import Tictactoe from './components/tic_tac_toe/Tictactoe';


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

        <p>react第三個元件</p>
        <h3>MyTicTacToe</h3>
        <Tictactoe/>


       
      </header>
    </div>
  );
}

export default App;
