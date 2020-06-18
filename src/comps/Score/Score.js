import React, { Component } from 'react';

import {
    BrowserRouter as Router, Switch, Route, Link
} from 'react-router-dom';

export default class Score extends Component {
    constructor(props) {
        super(props);
        this.state = { value: props.adminChooseBatchWords };
        this.props = props;
    }

    handleChange(event) {
        this.state.value = event.target.value;
        this.setState(this.state);
    }

    render() {
        let self = this;
        let score = "score";
        if (this.props.gameState.score != null && this.props.gameState.score != 0) {
            score = this.props.gameState.score;
        }
        return (
            <div className="orangeBox">
                <div className="orangeBoxText"
                >{score}</div>
            </div>
        );

    }
}