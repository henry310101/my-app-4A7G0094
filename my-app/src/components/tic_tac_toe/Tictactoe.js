import React, {useState} from "react";
import Board from "./Board";

function Tictactoe() {
    
    const [history, setHistory] = useState([Array(9).fill(null)]);
    const [currentMove, setCurrentMove] = useState(0);
    const xIsNext = currentMove % 2 === 0;
    const currentSquares = history[currentMove];

    const handlePlay = (nextSquares) => {
        const newHistory = [...history.slice(0, currentMove + 1), nextSquares];
        setHistory(newHistory);
        setCurrentMove(newHistory.length - 1);
    };

    
    const moves = history.map((squares, move)=>{
        let description;
        const jumTo = (nextMove) => setCurrentMove(nextMove);
        if (move > 0) description = "回到第"+move+"步";
        else description = "遊戲開始";
        return(
            <>
            <li key={move}>
                <button onClick={() => jumTo(move)}>{description}</button> 
            </li> 
            </>

        );

    }
    );

    return (
        <div className="game">
            <div className="game-board">
                <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay}/>
            </div>
            <div className="game-info">
                <h4>遊戲歷程</h4>
                <ul>{moves}</ul>
            </div>
        </div>
    );
}

export default Tictactoe;