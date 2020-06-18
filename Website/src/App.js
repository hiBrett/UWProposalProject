import React from 'react';
import './App.css';
import './Bootstrap/bootstrap.css';
import Home from './comps/Home/Home.js';
import {
    BrowserRouter as Router, Switch, Route, Link
} from 'react-router-dom';

export default class App extends React.Component {
    render() {
        return (
            <div className="App" style={{ width: "100%" }}>
                <Router basename={window.location.pathname || ''}>
                    <Route exact path="/" component={Home} />
                </Router>

                    

            </div>
        );
    };
}
