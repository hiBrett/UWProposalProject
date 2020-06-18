import React, { Component } from 'react';
export default function TotalPlayersOnline(props) {
    if (props.Show) {
        return <div className=""><div className="col-12 alert alert-info mt-5">
            There&nbsp;
            {props.totalPlayersOnline == 1 && <span>is</span>}
            {props.totalPlayersOnline != 1 && <span>are</span>} 
            &nbsp;{props.totalPlayersOnline}&nbsp;
            {props.totalPlayersOnline == 1 && <span>player</span>} 
            {props.totalPlayersOnline != 1 && <span>players</span>} 
            &nbsp;online.&nbsp;
            {props.isAdmin && props.totalPlayersOnline > 0 && !props.playing && <span>Please select a game.</span>}
            {!props.isAdmin && <span>Please wait for the host to start a game.</span>} 
            </div></div>
    } else {
        return <div></div>
    }
}