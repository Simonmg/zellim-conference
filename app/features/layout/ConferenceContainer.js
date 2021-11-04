import React, { Component } from 'react';
import Conference from '../components/conference';
export default class ConferenceContainer extends Component {
    constructor(props) {
        super(props);

    }

    render() {
        const { token, meetUrl } = this.props;
        return(
            <Conference token={token} meetUrl={meetUrl} />
        );
   }
}
