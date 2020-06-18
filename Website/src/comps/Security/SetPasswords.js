import React, { Component } from 'react';
import { SHA256 } from '../Security/SHA256.js';

import {
    BrowserRouter as Router, Switch, Route, Link
} from 'react-router-dom';

export default class SetPasswords extends Component {
    constructor(props) {
        super(props);
        this.state = { adminPassword: props.adminPassword, userPassword: props.userPassword };

        console.log("state admin password: " + this.state.adminPassword);

        this.handleSubmit = this.handleSubmit.bind(this);
        this.toggleShowPasswords = this.toggleShowPasswords.bind(this);
    }

    handleSubmit(event) {
        //let password = SHA256(this.state.value);
        let password = this.state.value;

        this.props.SetNewPassword(true, this.props.adminPassword, this.props.home);
        this.props.SetNewPassword(false, this.props.userPassword, this.props.home);

        event.preventDefault();
    }

    toggleShowPasswords(event) {
        this.props.toggleShowPasswords(this.props.home);
        event.preventDefault();
    }


    render() {
        if (this.props.Show) {
            console.log("k: " + JSON.stringify(this.state));
            return (
                <div className="pt-5">
                    <form onSubmit={this.toggleShowPasswords}>
                        <input type="submit" className="d-block w-100 btn btn-light" value="Set Passwords"></input>
                    </form>
                    {this.props.showPasswords &&
                        <form data-lpignore="true" onSubmit={this.handleSubmit}>
                            <div style={{ justifyContent: "center" }} className="d-inline-flex align-items-center form-group row mt-5 w-100">

                                <input data-lpignore="true" value={this.props.adminPassword} onChange={(e) => this.props.updateAdminPasswordText(e, this.props.home)} className="col-6 font-arial" id="adminPassword" type="text" name="adminPassword"></input>
                                <label style={{ textAlign: "left" }} htmlFor="adminPassword" className="pl-2 mt-2 col-3">: Admin Password</label>

                                <input data-lpignore="true" value={this.props.userPassword} onChange={(e) => this.props.updateUserPasswordText(e, this.props.home)} className="col-6 font-arial" id="userPassword" type="text" name="userPassword"></input>
                                <label style={{ textAlign: "left" }} htmlFor="userPassword" className="pl-2 mt-2 col-3">: User Password</label>

                                <input type="submit" className="d-block w-100 btn btn-light" value="Save"></input>
                            </div>
                        </form>
                    }
                </div>
            );
        } else {
            return <span></span>
        }
    }
}