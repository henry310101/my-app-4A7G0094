import React, { useState } from "react";
import Board from "./Board";
import './tictactoe.css';

function Tictactoe() {
    //九宮格內的數值為0
    const [history, setHistory] = useState([Array(9).fill(null)]);
    //設定目前的步數
    const [currentMove, setCurrentMove] = useState(0);
    //判斷目前是O還是X
    const xIsNext = currentMove % 2 === 0;
    //提取當前步驟的棋盤狀態
    const currentSquares = history[currentMove];
    //狀態紀錄
    const handlePlay = (nextSquares) => {
        const newHistory = [...history.slice(0, currentMove + 1), nextSquares];
        setHistory(newHistory);
        setCurrentMove(newHistory.length - 1);
    };
    //重設遊戲
    const resetGame = () => {
        setHistory([Array(9).fill(null)]);
        setCurrentMove(0);
    };
    //跳到第幾步
    const jumpTo = (nextMove) => {
        setCurrentMove(nextMove);
        setHistory(history.slice(0, nextMove + 1));
    };
    //每一步的狀態
    const moves = history.map((squares, move) => {
        let description;
        if (move > 0) {
            description = "回到第" + move + "步";
        } 
        else {
            description = "遊戲開始";
        }

        return (
            <li key={move}>
                <button onClick={ () => {                   
                        if (move > 0){
                            jumpTo(move)
                        }
                        else {
                            resetGame() 
                        }
                    }
                    }>
                    {description}
                </button>
            </li>
        );
    });

    return (
        <div className="game">
            <div className="game-board">
                <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
            </div>
            <div className="game-info">
                <h4 style={{ marginBottom: '5px' }}>遊戲歷程</h4>
                <ul style={{ marginTop: '0', paddingLeft: '20px' }}>{moves}</ul>
            </div>
        </div>
    );
}

export default Tictactoe;
