import React, { Component } from 'react';
export default function LoginFailed(props) {
    if (props.Show) {
        return <div className="row col-12 alert alert-danger mt-5">Login failed. Please try again.</div>
    } else {
        return <div></div>
    }
}