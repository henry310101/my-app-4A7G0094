import React, {useState} from "react";
import Board from "./Board";

function Tictactoe() {
    const [history, setHistory] = useState([Array(9).fill('X')]);
    const [currentMove, setCurrentMove] = useState(0);
    const currentSquares = history[currentMove];
    const xIsNext = currentMove % 2 === 0;
    return (
        <div className="game">
            <div className="game-board">
                <Board squares={currentSquares}/>
            </div>
            <div className="game-info">
                <h4>遊戲歷程</h4>

            </div>
        </div>
    );
}

export default Tictactoe;