import React, { Component } from 'react';

import {
    BrowserRouter as Router, Switch, Route, Link
} from 'react-router-dom';

export default class AdminStartGame extends Component {
    constructor(props) {
        super(props);
        this.props = props;

        this.handleSubmit = this.handleSubmit.bind(this);

    }

    handleSubmit(event) {
        //let password = SHA256(this.state.value);
        let words = this.props.savedBatchWords;

        console.log("submitting words: " + words);

        this.props.StartGame(this.props.home);

        event.preventDefault();
    }


    render() {
        console.log("savedBatchWords: " + this.props.savedBatchWords);

        if (this.props.Show) {
            return (
                <form data-lpignore="true" onSubmit={this.handleSubmit}>
                    <div style={{ justifyContent: "center" }} className="d-inline-flex align-items-center form-group row mt-2 w-100">

                        <input type="submit" className="d-block w-100 btn btn-primary mt-3" value="Start Game"></input>

                    </div>
                </form>
            );
        } else {
            return (<span></span>);
        }
    }
}