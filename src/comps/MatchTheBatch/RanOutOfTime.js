import React, { Component } from 'react';
export default function RanOutOfTime(props) {
    if (props.Show) {
        return <div className="bg-dark-gray gameResultPage" style={{ width: "100vw", height: "100vh" }}>
            <div className="d-block col-12 gameResultPageTitle"><span className="d-block col-12 gameResultPageText">Game Over</span></div>
        </div>
    } else {
        return <div></div>
    }
}