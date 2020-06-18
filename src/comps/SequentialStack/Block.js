import React, { Component } from 'react';
export default function Block(props) {
    let block = props.block;

    return <div class={"playerCircle x" + props.positions[block.index].x + " y" + props.positions[block.index].y + " " + props.color}>
    </div>

}