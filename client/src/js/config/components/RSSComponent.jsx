/*eslint max-len:0 no-unused-vars:0*/
"use strict";
import React, { Component, PropTypes } from "react";
import { addRssUrlAsync } from "../actions/CategoryActions.js";

let urlRegex = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/i;

export default class RSSComponent extends Component {

    constructor(props) {
        super(props);

        this.state = { "showTextbox": false, "errorMessage": "", "urlError": "", "showUrlError": false };
    }

    _onUrlChange() {}

    _addNewUrlButton() {
        this.setState({
            "showTextbox": true
        });
    }

    _onKeyDownTextBox(event, props) {
        const ENTERKEY = 13;
        if(event.keyCode === ENTERKEY) {
            this._validateAndUpdateUrl(props);
        }
    }

    _validateAndUpdateUrl(props) {
        let url = this.refs.addUrlTextBox.value.trim();
        let errorMessage = this._isInvalidUrl(url);
        this.setState({ "errorMessage": errorMessage });
        if(errorMessage.length === 0) {
            this.setState({ "urlError": "Checking feeds please wait...", "showUrlError": true });
            props.dispatch(addRssUrlAsync(props.categoryId, url, (response)=> {
                let errorMsg = response === "invalid" ? "Fetching feeds failed" : "Fetched feeds";
                this.setState({ "urlError": errorMsg, "showUrlError": false });
            }));
            this.refs.addUrlTextBox.value = "";
            this.setState({ "showTextbox": false });
        }
    }

    _isInvalidUrl(url) {
        if(!url.match(urlRegex)) {
            return url ? "Invalid URL format" : "URL should not be empty";
        }

        let result = "";
        this.props.content.some((obj)=> {
            if(obj.url.toLowerCase().trim() === url.toLowerCase().trim()) {
                result = "URL is already added";
            }
        });
        return result;
    }

    render() {

        let inputBox = null;
        if(this.state.showTextbox) {
            let addUrlClasses = this.state.errorMessage ? "add-url-input box error-border" : "add-url-input box";
            inputBox = (
                <div>
                    <input type="text" ref="addUrlTextBox" autoFocus className={addUrlClasses} placeholder="Enter url here" onBlur={()=> this._validateAndUpdateUrl(this.props)} onKeyDown={(event) => this._onKeyDownTextBox(event, this.props)}/>
                    <div className="error-message">{this.state.errorMessage}</div>
                </div>
            );
        }

        let errorMsg = this.state.showUrlError ? <div className="spinner spinner-msg">{this.state.urlError}</div> : null;

        return (
            <div>
                <div className="nav-control h-center" id="addNewUrlButton" onClick={(event) => this._addNewUrlButton()}>
                    <i className="fa fa-plus"></i><span ref="addUrlLinkTex">{this.props.categoryDetailsPageStrings.addUrlLinkLabel}</span>
                </div>
                <div className="url-panel">
                    <ul classaName="url-list">
                        {this.props.content.map((urlObj, index) =>
                                <li key={index} className="feed-url">
                                    <input type="text" className={urlObj.status} value={urlObj.url} onChange={this._onUrlChange} />
                                    <i className="border-blue circle fa fa-close close circle"></i>
                                </li>
                        )}
                    </ul>
                {inputBox}
                {errorMsg}
                </div>
            </div>
        );
    }
}

RSSComponent.displayName = "Tab Control";
RSSComponent.propTypes = {
    "content": PropTypes.array.isRequired,
    "content.details": PropTypes.array,
    "categoryDetailsPageStrings": PropTypes.object.isRequired
};
