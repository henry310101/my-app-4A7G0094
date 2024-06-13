import React from "react";
import {useState} from "react";
import MySlider from "./MySlider";

function MyRGBPanel(){
    const panelCSS = {
        display: "flex",
        flexDirection: "column",
        border: "1px solid black",
        borderRadius: "10px",
        width: "300px",
        padding: "30px",
        alignItems: "center",
        margin: "auto",
        justifyContent:"center"
    };
    const [red, setRed] = useState(0);
    const [green, setGreen] = useState(0);
    const [blue, setBlue] = useState(0);

    const updateRed = (c) =>setRed(c);
    const updateGreen = (c) =>setGreen(c);
    const updatBlue = (c) =>setBlue(c);

    return(
        <>
            <div style={panelCSS}>
                <h3>MyRGBPanel元件</h3>
                        <div 
                        style={{
                        backgroundColor: `rgb(${red}, ${green}, ${blue})`,
                        width:"200px",
                        height:"150px",
                        }}/>
                        <MySlider label = "RED" onChange = {updateRed}/>
                        <MySlider label = "GREEN" onChange = {updateGreen}/>
                        <MySlider label = "BLUE" onChange = {updatBlue}/>
            </div>
        </>
    );
}

export default MyRGBPanel;