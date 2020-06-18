import React, { Component } from 'react';

import {
    BrowserRouter as Router, Switch, Route, Link
} from 'react-router-dom';

export default class BatchWord extends Component {
    constructor(props) {
        super(props);
        this.state = { value: props.adminChooseBatchWords };
        this.props = props;

        this.state.width = 0;
        this.state.height = 0;
        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.state.value = event.target.value;
        this.setState(this.state);
        this.props.revealWord(this.props.home, this.props.index);
    }

    handleSubmit(event) {
        //let password = SHA256(this.state.value);
        let words = this.state.value;

        console.log("handleSubmit " + this.props.index + " home is null: " + (this.props.home == null));

        this.props.revealWord(this.props.home, this.props.index);

        event.preventDefault();
    }



    componentDidMount() {
        this.updateWindowDimensions();
        window.addEventListener('resize', this.updateWindowDimensions);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateWindowDimensions);
    }

    updateWindowDimensions() {
        this.state.width = window.innerWidth;
        this.state.height = window.innerHeight;
        this.setState(this.state);
    }

    render() {
        let height = (window.innerHeight - 400) / 4.5;
        let self = this;
            return (
                <div className="p-0 matchCardBG" style={{ width: "30%", height: height + "px", marginTop: "2%", marginRight: "0", marginBottom: "0", marginLeft: "2.5%"}}>
                    <div className="matchCardText">{this.props.word}</div>
                    {!this.props.revealed && <div onClick={self.handleSubmit} style={{ height: height * 0.9 + "px" }} className={"matchCardCover bg-orange " + (this.props.putBack ? " matchCardCoverMovedBack" : "") + (this.props.picked ? " matchCardCoverMoved" : "") + (this.props.dissolve ? " matchCardCoverDissolve" : "")}></div>}
                </div>
            );
        
    }
}