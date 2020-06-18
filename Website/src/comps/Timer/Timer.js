import React, { Component } from 'react';

import {
    BrowserRouter as Router, Switch, Route, Link
} from 'react-router-dom';

export default class Timer extends Component {
    constructor(props) {
        super(props);
        this.state = { timeRemaining: this.props.gameState.timeRemaining, timeOfGameEnd: (this.epochSeconds() + this.props.gameState.timeRemaining) };
        this.state.displayedTimeRemaining = Math.floor(this.props.gameState.timeRemaining);
        this.state.timeOfGameEnd = this.epochSeconds() + this.state.displayedTimeRemaining;
        console.log("time constructor");
        this.props = props;
    }

    componentDidMount() {
        console.log("timer mount");
        let self = this;

        this.interval = setInterval(function () {
            if (self.props.gameState.CountdownActive) {
                self.state.displayedTimeRemaining = Math.floor(self.state.timeOfGameEnd - self.epochSeconds());
                self.setState(self.state);
            }
        }, 100);

    }

    componentWillReceiveProps(nextProps) {
        if (Math.abs(nextProps.gameState.timeRemaining - this.state.timeRemaining) > 1) {
            this.state.displayedTimeRemaining = Math.floor(nextProps.gameState.timeRemaining);
            this.setState(this.state);
        }

        this.state.timeOfGameEnd = this.epochSeconds() + this.state.displayedTimeRemaining;
        this.setState(this.state);
    }

    componentWillUnmount() {
        console.log("timer unmount");
        clearInterval(this.interval);
    }

    decimal(n) {
        n = Math.abs(n); // Change to positive
        let decimal = n - Math.floor(n);
        return decimal;
    }


    epochSeconds() {
        return Math.floor(new Date() / 1000);
    }

    render() {
        let self = this;
        let minutes = Math.floor(this.state.displayedTimeRemaining / 60);
        let seconds = this.state.displayedTimeRemaining - minutes * 60;

        if (minutes < 0 || seconds < 0) {
            minutes = 0;
            seconds = 0;
        }

        let secondsText = "" + seconds;
        if (secondsText.length == 1) {
            secondsText = "0" + secondsText;
        }
        return (
            <div>
                {
                    (this.props.showTimerText) &&
                    <div className="timertextHolder d-inline-block">
                        <div className="d-block timertext">TIMER</div>
                    </div>
                }

                <div className={"orangeBox d-inline-block" + (this.props.large ? " large" : "")}>
                    <div className={"orangeBoxText" + (this.props.large ? " large" : "")}
                    >{minutes + ":" + secondsText}</div>
                </div>
            </div>
        );

    }
}