import React, { Component } from 'react';

import Api from '../../utils/api';
import ZellimLogo from '../../images/zellim-logo';
import { ELECTRON_CHANNELS } from '../../config';
import './css/conference.css';

export default class Conference extends Component {

    _api;

    state = {
        containerId: 'meetContainer',
        roomData: null,
        token: this.props.token,
        meetUrl: null,
        roomInfoLoaded: false
    }

    constructor(props) {
        super(props);
        this.loadListeners()
        this._api = new Api();
    }


    loadListeners() {
        if (window.jitsiNodeAPI.ipc) {
            window.jitsiNodeAPI.ipc.send('renderer-ready', {load: true});
            window.jitsiNodeAPI.ipc.on('protocol-data-msg',
                (event, data) => {
                    this.setState({meetUrl: data.meetURL[0]});
                    const { meetUrl, token } = this.state;
                    this.setRoomInfo(meetUrl, token);
                });
        }
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

    async setRoomInfo(roomUrl, token) {
        const roomInfo = await this._api.getRomInfo(this.getRoomFromURL(roomUrl), token);
        this.setState({ roomInfo, roomInfoLoaded: true });
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

    renderConference() {
        if ((this.state.roomInfo && this.state.roomInfo.moderator) || 
            (this.state.roomInfo && !this.state.roomInfo.moderator && this.state.roomInfo.roomInfo.open)) 
        {
            const { meetUrl, token } = this.state;
            this.startConference(token, meetUrl);
            return (
                <div id={this.state.containerId} className="meet-container"></div>
            )
        } 
        else {
            return (
                <div className="d-flex margin-auto justify-content-center w-100 h-100">
                    <div className="d-flex flex-column justify-content-center m-auto">
                        <ZellimLogo height={128} width={128} />
                        <h3 className="text-white text-center mt-4">Room Closed</h3>
                    </div>
                </div>
            )
        }
    }


    render() {
        return(
            <>
                { this.renderConference() }
            </>
        )
    }

}
