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

    state = {
        token: null,
        meetUrl: null
    }

    componentDidMount() {
        this.getToken().then(zlmToken => this.setState({token: zlmToken}));
    }

    async getToken() {
        return await localStorage.getItem('zlmToken');
    }


    render() {
        const { token } = this.state;
        return (
            token ? (
                <ConferenceContainer 
                    token={token}
                />
            ) : (
                <AuthContainer />
            )
        )
    }
}

render(<Root />, document.getElementById('app'));