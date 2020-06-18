import React, { Component } from 'react';
export default function BatchWinners(props) {
    if (props.Show) {
        return <div className="bg-success gameResultPage" style={{ width: "100vw", height: "100vh" }}>
            <div className="d-block col-12 gameResultPageTitle">Success! <span className="d-block col-12 gameResultPageText">{props.gameState.completedInText}</span></div>
        </div>
    } else {
        return <div></div>
    }
}