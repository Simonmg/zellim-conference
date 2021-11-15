import React, { Component } from 'react';
import Conference from '../components/conference';
export default class ConferenceContainer extends Component {
    constructor(props) {
        super(props);

    }

    render() {
        const { token } = this.props;
        return(
            <Conference token={token}/>
        );
   }
}
