import React, { Component } from 'react';
import Timer from '../Timer/Timer';
import Score from '../Score/Score';
export default function TimeScoreBar(props) {
    return <div className="d-block col-12 mb-3 d-flex justify-content-between mt-3">
        <Score gameState={props.gameState} /><Timer large={true} showTimerText={true} gameState={props.gameState} />
    </div>

}