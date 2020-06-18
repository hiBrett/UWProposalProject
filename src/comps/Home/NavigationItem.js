import React, { Component } from 'react';
export default function NavigationItem(props) {
    return <div onClick={function () { props.SubmitStartPlayingGame(props.home, props.game) }} className={"d-inline navigationItem" + ((props.gameState.currentGame == props.game) ? " navigationItemWhite" : "")}>{props.game}</div>

}