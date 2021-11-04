// @flow

/**
 * AtlasKit components will deflect from appearance if css-reset is not present.
 */
import '@atlaskit/css-reset';
import 'bootstrap/dist/css/bootstrap.css';

import React, { Component } from 'react';
import { render } from 'react-dom';
import localStorage from 'mobx-localstorage';

import ConferenceContainer from './features/layout/ConferenceContainer';
import AuthContainer from './features/layout/AuthContainer';

class Root extends Component {

    constructor(props) {
        super(props);
        this.state = {
            meetUrl: null,
            token: null
        }

        this.loadListeners();
    }

    loadListeners() {
        if (window.jitsiNodeAPI.ipc) {
            window.jitsiNodeAPI.ipc.send('renderer-ready', {load: true});
            window.jitsiNodeAPI.ipc.on('protocol-data-msg', 
                (event, data) => this.setState({meetUrl: data.meetURL[0]}));
        }
    }

    componentDidMount() {
        this.getToken().then(zlmToken => this.setState({token: zlmToken}));
    }

    async getToken() {
        return await localStorage.getItem('zlmToken');
    }


    render() {
        return (
            this.state.token && this.state.meetUrl ? (
                <ConferenceContainer 
                    token={this.state.token}
                    meetUrl={this.state.meetUrl} 
                />
            ) : (
                <AuthContainer 
                    meetUrl={this.state.meetUrl} 
                />
            )
        )
    }
}

render(<Root />, document.getElementById('app'));