import React, { Component } from 'react';

import {
    BrowserRouter as Router, Switch, Route, Link
} from 'react-router-dom';

export default class AdminChooseMatchTheBatchWords extends Component {
    constructor(props) {
        super(props);
        this.props = props;

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);

    }

    handleChange(event) {
        console.log("handleChange: " + event.target.value);
        this.props.updateAdminChooseBatchWords(event, this.props.home);
    }

    handleSubmit(event) {
        //let password = SHA256(this.state.value);
        let words = this.props.savedBatchWords;

        console.log("submitting words: " + words);

        this.props.StartBatchWordsGame(this.props.home);

        event.preventDefault();
    }


    render() {
        console.log("savedBatchWords: " + this.props.savedBatchWords);

        if (this.props.Show) {
            return (
                <form data-lpignore="true" onSubmit={this.handleSubmit}>
                    <div style={{ justifyContent: "center" }} className="d-inline-flex align-items-center form-group row mt-2 w-100">

                        <label style={{ textAlign: "left" }} htmlFor="words" className="mt-2 col-12">Enter 12 words that the players find as values. Separate each word with a comma.</label>
                        <input data-lpignore="true" value={this.props.savedBatchWords} onChange={this.handleChange} className="col-12 font-arial" id="words" type="text" name="words"></input>
                        <input type="submit" className="d-block w-100 btn btn-primary mt-3" value="Continue"></input>
                        
                    </div>
                </form>
            );
        } else {
            return (<span></span>);
        }
    }
}