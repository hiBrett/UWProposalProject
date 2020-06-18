import React, { Component } from 'react';
export default function ErrorSettingBatchWords(props) {
    if (props.Show) {
        return <div className="row col-12 alert alert-danger mt-5">Error: There should be 12 words separated by commas.</div>
    } else {
        return <div></div>
    }
}