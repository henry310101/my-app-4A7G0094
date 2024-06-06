import React from 'react';
import './calculator.css';

function MyDisplay(props) {
  return (
    <div className='dispaly'>
        {props.result}
    </div>
  );
}

export default MyDisplay;