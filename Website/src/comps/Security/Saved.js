import React, { Component } from 'react';
export default function Saved(props) {
    if (props.Show) {
        return <div className="row col-12 alert alert-success mt-5">Saved.</div>
    } else {
        return <div></div>
    }
}