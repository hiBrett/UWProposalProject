import React, { Component } from 'react';
export default function LoggingIn(props) {
    if (props.Show) {
        return <div className="row col-12 alert alert-secondary mt-5">Logging in. . .</div>
    } else {
        return <div></div>
    }
}