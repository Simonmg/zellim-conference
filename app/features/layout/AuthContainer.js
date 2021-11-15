import React, { Component } from 'react';
import Auth from '../components/auth';
export default class AuthContainer extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return(
            <Auth />
        );
    }
}
