import React, { Component } from 'react';
import { SHA256 } from '../Security/SHA256.js';
import Timer from '../Timer/Timer';
import Circle from './Circle';
import Block from './Block';

import {
    BrowserRouter as Router, Switch, Route, Link
} from 'react-router-dom';

export default class SequentialStack extends Component {
    constructor(props) {
        super(props);
        this.state = { value: '' };
        this.props = props;

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.allowDrop = this.allowDrop.bind(this);
        this.drag = this.drag.bind(this);
        this.drop = this.drop.bind(this);
    }

    handleChange(event) {
        this.setState({ value: event.target.value });
        this.props.StartedEnteringNewPassword(this.props.home);
    }

    handleSubmit(event) {
        //let password = SHA256(this.state.value);
        let password = this.state.value;

        this.props.SubmitPassword(password, this.props.home);

        this.setState({ value: "" });
        event.preventDefault();
    }

    allowDrop(ev) {
        ev.preventDefault();
    }
    drag(ev) {
        ev.dataTransfer.setData("text", ev.target.id);
    }
    drop(ev) {
        ev.preventDefault();
        var data = ev.dataTransfer.getData("text");
        ev.target.appendChild(document.getElementById(data));
    }


    render() {

        let positions = [
            { "x": 0, "y": 3 }, //Start
            { "x": 3, "y": 3 }, /*1*/
            { "x": 5, "y": 1 }, /*2*/
            { "x": 5, "y": 5 }, /*3*/
            { "x": 2, "y": 2 }, /*4*/
            { "x": 8, "y": 2 }, /*5*/
            { "x": 2, "y": 4 }, /*6*/
            { "x": 9, "y": 5 }, /*7*/
            { "x": 1, "y": 1 }, /*8*/
            { "x": 4, "y": 2 }, /*9*/
            { "x": 7, "y": 1 }, /*10*/
            { "x": 6, "y": 4 }, /*11*/
            { "x": 1, "y": 5 }, /*12*/
            { "x": 3, "y": 1 }, /*13*/
            { "x": 8, "y": 4 }, /*14*/
            { "x": 6, "y": 2 }, /*15*/
            { "x": 9, "y": 1 }, /*16*/
            { "x": 4, "y": 4 }, /*17*/
            { "x": 7, "y": 5 }, /*18*/
            { "x": 3, "y": 5 }, /*19*/
            { "x": 7, "y": 3 }, /*20*/
        ];

        let blockColors = [
            "first",
            "second",
            "third",
            "fourth",
            "fifth"
        ];


        let self = this;
        console.log("match the batch home null: " + (this.props.home == null));
        if (this.props.Show && this.props.gameState != null && this.props.gameState.blocks != null) {
            return (
                <div className="SequentialStackContainer">

                    <div className="SequentialStackItem x5 y3"><Timer gameState={this.props.gameState} /></div>




                    {
                        positions.map((position, index) => (
                            <Circle moveSeq={this.props.moveSeq} position={position} number={index} home={self.props.home} />
                        ))
                    }


                    {
                        this.props.gameState.blocks.slice(0).reverse().map((block, index) => (
                            <Block block={block} positions={positions} color={blockColors[blockColors.length - 1 - index]} />
                        ))
                    }



                </div>
            );
        } else {
            return (<span></span>);
        }
    }
}