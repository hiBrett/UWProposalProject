import React, { Component } from 'react';
export default function Welcome(props) {
    if (props.Show) {
        return <div><div className="row col-12 text-center mt-5 pt-3" style={{ fontSize: "1.2em", justifyContent: "center" }}>Welcome to the Team-Building Prototype Website.</div><div className="d-block mt-4 col-12 alert alert-secondary mb-3">To play: login as an admin in one window and as a user in another window.</div></div>
    } else {
        return <span></span>
    }
}