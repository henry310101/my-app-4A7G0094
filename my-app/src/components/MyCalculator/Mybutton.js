import React from 'react'; 
import './calculator.css';

function Mybutton(props) {
    const handleclick = (e) => {
        props.buttonClicked(e.target.value);
    }



    return (
        <div>
            <div className="buttons">
                <div>
                    <button className="btn btn-action" onClick={handleclick} value="c">C</button>
                    <button className="btn btn-action" onClick={handleclick} value="+/-">+/-</button>
                    <button className="btn btn-action" onClick={handleclick} value="%">%</button>
                    <button className="btn btn-operator" onClick={handleclick} value="/">/</button>
                </div>
                <div>
                    <button className="btn btn-number" onClick={handleclick} value="7">7</button>
                    <button className="btn btn-number" onClick={handleclick} value="8">8</button>
                    <button className="btn btn-number" onClick={handleclick} value="9">9</button>
                    <button className="btn btn-operator" onClick={handleclick} value="*">*</button>
                </div>
                <div>
                    <button className="btn btn-number" onClick={handleclick} value="4">4</button>
                    <button className="btn btn-number" onClick={handleclick} value="5">5</button>
                    <button className="btn btn-number" onClick={handleclick} value="6">6</button>
                    <button className="btn btn-operator" onClick={handleclick} value="-">-</button>
                </div>
                <div>
                    <button className="btn btn-number" onClick={handleclick} value="1">1</button>
                    <button className="btn btn-number" onClick={handleclick} value="2">2</button>
                    <button className="btn btn-number" onClick={handleclick} value="3">3</button>
                    <button className="btn btn-operator" onClick={handleclick} value="+">+</button>
                </div>
                <div>
                    <button className="btn zero" onClick={handleclick} value="0">0</button>
                    <button className="btn btn-number" onClick={handleclick} value=".">.</button>
                    <button className="btn btn-operator" onClick={handleclick} value="=">=</button>
                    
                </div>

            </div>
        </div>
    );
};

export default Mybutton;