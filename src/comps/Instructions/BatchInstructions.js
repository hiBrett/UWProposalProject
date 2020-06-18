import React, { Component } from 'react';
export default function BatchInstructions(props) {
    if (props.Show) {
        return <div className="col-12 alert alert-info mt-5">
            <div className="d-block col-12"><h2>Match The Batch</h2></div>
            <div className="d-block col-12">
                <p>Match the words on the left and right</p>
            </div>
        </div>
    } else {
        return <div></div>
    }
}