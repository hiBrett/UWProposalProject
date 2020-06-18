import React, { Component } from 'react';
export default function SequentialStackInstructions(props) {
    if (props.Show) {
        return <div className="col-12 alert alert-info mt-5">
            <div className="d-block col-12"><h2>Sequential Stack</h2></div>
            <div className="d-block col-12">
                <p>Move the blocks in order of smallest to largest through the sequence of numbers 1-20.</p>
            </div>
        </div>
    } else {
        return <div></div>
    }
}