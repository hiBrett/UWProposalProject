import React, { Component } from 'react';
import { SHA256 } from '../Security/SHA256.js';

import {
    BrowserRouter as Router, Switch, Route, Link
} from 'react-router-dom';
import BatchWord from './BatchWord.js';
import TimeScoreBar from './TimeScoreBar.js';

export default class MatchTheBatch extends Component {
    constructor(props) {
        super(props);
        this.state = { value: '' };
        this.props = props;

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
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


    render() {
        let self = this;
        console.log("match the batch home null: " + (this.props.home == null));
        if (this.props.Show && this.props.gameState != null && this.props.gameState.batchWords != null) {
            return (
                <div>
                    <div className="row w-100 p-0 m-0" style={{ height: window.innerHeight - 400 + "px" }}>
                        <TimeScoreBar gameState={self.props.gameState} />
                        <div className="p-0 m-0" style={{ width: "45.5%" }}>{this.props.gameState.batchWords.slice(0, 12).map(function (word, i) {
                            return <BatchWord word={word} revealed={self.props.gameState.revealed != null && self.props.gameState.revealed[i]} revealWord={self.props.revealWord} home={self.props.home} picked={self.props.gameState.pickedA == i} putBack={self.props.gameState.putBackA == i} dissolve={self.props.gameState.dissolveA == i} index={i} />
                        })}</div>
                        <div className="" style={{ width: "8%" }}></div>
                        <div className="p-0 m-0" style={{ width: "45.5%" }}>{this.props.gameState.batchWords.slice(12, 24).map(function (word, i) {
                            return <BatchWord word={word} revealed={self.props.gameState.revealed != null && self.props.gameState.revealed[i + 12]} revealWord={self.props.revealWord} home={self.props.home} picked={self.props.gameState.pickedB == (i + 12)} putBack={self.props.gameState.putBackB == (i+12)} dissolve={self.props.gameState.dissolveB == (i+12)} index={i + 12} />
                        })}</div>
                    </div>
                </div>
            );
        } else {
            return (<span></span>);
        }
    }
}