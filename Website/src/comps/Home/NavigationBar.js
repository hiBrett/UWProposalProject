import React, { Component } from 'react';
import {
    BrowserRouter as Router, Switch, Route, Link
} from 'react-router-dom';
import NavigationItem from './NavigationItem';

export default class NavigationBar extends Component {
    constructor(props) {
        super(props);

        this.home = this.home.bind(this);
    }

    home(event) {
        console.log("go home");
        this.props.SubmitStartPlayingGame(this.props.home, "home");
    }

    render() {
        return (


            <div className="navbar bg-orange text-black">


                <span onClick={this.home} className="title"><b>[ FS <span className="text-white">Testing</span> Platform ]</b></span>

                {this.props.isAdmin && <ul>
                    <li><NavigationItem game={"Sequential Stack"} home={this.props.home} gameState={this.props.gameState} SubmitStartPlayingGame={this.props.SubmitStartPlayingGame} /></li>
                    <li><NavigationItem game={"Match The Batch"} home={this.props.home} gameState={this.props.gameState} SubmitStartPlayingGame={this.props.SubmitStartPlayingGame} /></li>
                </ul>}

            </div>

        );
    }
}