import React, { Component } from 'react';
export default function AdminCantPlay(props) {
    if (props.Show) {
        return <div className="col-12 alert alert-danger mt-5">
            <div className="d-block col-12">
                <p>The admin can't play. To play: login as a user in a new window.</p>
            </div>
        </div>
    } else {
        return <div></div>
    }
}