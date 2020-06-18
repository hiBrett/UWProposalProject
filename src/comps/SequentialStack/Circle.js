import React, { Component } from 'react';
export default function Circle(props) {
    let number = props.number;

    return <div onClick={() => { props.moveSeq(props.home, number) }} className={"SequentialStackItem x" + props.position.x + " y" + props.position.y + " SequentialCircle " + (number == 0 ? " SequentialCircleGreen" : "") + (number == 20 ? " SequentialCircleRed" : "")}>
        <div className={"SequentialCircleText" + (number == 0 ? " SequentialCircleStart" : "")}>{
            number == 0 ? "START" : number
        }</div>
    </div>

}