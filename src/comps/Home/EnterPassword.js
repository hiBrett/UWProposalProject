import React, { Component } from 'react';
import { SHA256 } from '../Security/SHA256.js';

import {
    BrowserRouter as Router, Switch, Route, Link
} from 'react-router-dom';

export default class EnterPassword extends Component {
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
        if (this.props.Show) {
            return (
                <form data-lpignore="true" onSubmit={this.handleSubmit}>
                    <div style={{ justifyContent: "center" }} className="d-inline-flex align-items-center form-group row mt-2 w-100">

                        <input data-lpignore="true" value={this.state.value} onChange={this.handleChange} className="col-6 font-arial" id="password" type="password" name="password"></input>
                        <label style={{ textAlign: "left" }} htmlFor="password" className="pl-2 mt-2">: Please enter a password</label>

                    </div>
                </form>
            );
        } else {
            return (<span></span>);
        }
    }
}