import React, { Component } from 'react';

import Api from '../../utils/api';
import ZellimLogo from '../../images/zellim-logo';
import { ELECTRON_CHANNELS } from '../../config';
import './css/conference.css';

export default class Conference extends Component {

    _api;

    constructor(props) {
        super(props);
        this.state = {
            containerId: 'meetContainer',
            roomData: null,
            token: this.props.token,
            meetUrl: this.props.meetUrl
        }

        this._api = new Api();
    }

    componentDidMount() {
        this.getRoomInfo(
            this.state.meetUrl, 
            this.state.token
        ).then(data => this.setRoomData(data));
    }

    setRoomData(data) {
        this.setState({
            roomData: data
        })
    }


    loadJitsiApi() {

        let resolveLoadJitsiScriptPromise = null;

        const loadJitsiScriptPromise = new Promise(resolve => { resolveLoadJitsiScriptPromise = resolve });

        const script = document.createElement("script");
        script.src = "https://meet.jit.si/external_api.js";
        script.async = true;
        script.onload = resolveLoadJitsiScriptPromise;
        document.body.appendChild(script);

        return loadJitsiScriptPromise;
    }

    async getRoomInfo(roomUrl, token) {
        return await this._api.getRomInfo(
            this.getRoomFromURL(roomUrl),
            token
        );
    }

    async startConference(userToken, meetUrl) {

        let _jitsi;

        if (!window.JitsiMeetExternalAPI) {
            await this.loadJitsiApi();
        }
        const roomInfo = await this._api.getRomInfo( 
            this.getRoomFromURL(meetUrl),
            userToken);

        const options = {
            host: "meeting.zellim.com",
            roomName: this.getRoomFromURL(meetUrl),
            jwt: roomInfo.accessToken,
            parentNode: document.getElementById(this.state.containerId)
        }

        _jitsi = new window.JitsiMeetExternalAPI(options.host, { ...options });

        const {
            setupScreenSharingRender,
            setupAlwaysOnTopRender,
            initPopupsConfigurationRender,
          } = window.jitsiNodeAPI.jitsiMeetElectronUtils;

          setupScreenSharingRender(_jitsi);
          setupAlwaysOnTopRender(_jitsi);
          initPopupsConfigurationRender(_jitsi);

          _jitsi.on("suspendDetected", this.onVideoConfecenceEnded);
          _jitsi.on("readyToClose", this.onVideoConfecenceEnded);
          _jitsi.on("videoConferenceJoined", (conferenceInfo) => {
            window.jitsiNodeAPI.ipc.send(ELECTRON_CHANNELS.MEET_DATA, conferenceInfo);
            this.onVideoConferenceJoined(conferenceInfo);
        });
    }

    // control function
    onVideoConferenceJoined(conferenceInfo) {
        const { id } = conferenceInfo;
    }

    // close ipc function
    onVideoConfecenceEnded(event) {
        window.jitsiNodeAPI.ipc.send(ELECTRON_CHANNELS.MEET_DATA, {close: true});
    }

    getRoomFromURL(url) {
        return url.split(".")[0].replace("https://", "");
    }


    render() {

        const {
            token,
            meetUrl
        } = this.props;
        
        console.log(this.state);
        let render;

        if (this.state.roomData && this.state.roomData.moderator) {
            this.startConference(token, meetUrl);
            render = <div id={this.state.containerId} className="meet-container"></div>
        } else if (this.state.roomData?.roomInfo?.open) {
            this.startConference(token, meetUrl);
            render = <div id={this.state.containerId} className="meet-container"></div>
        } else {
            render = <div className="d-flex margin-auto justify-content-center w-100 h-100">
                        <div className="d-flex flex-column justify-content-center m-auto">
                            <ZellimLogo height={128} width={128} />
                            <h3 className="text-white text-center mt-4">Room Closed</h3>
                        </div>
                     </div>
        };

        return(
            <>
                { render }
            </>
        )
       
    }

}
