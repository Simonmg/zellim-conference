const { ipcRenderer } = require('electron');
const jitsiMeetElectronUtils = require('jitsi-meet-electron-utils');

const MEET_CHANEL = 'meet_chanel';
const MEET_DATA = 'meet_data';

const whitelistedIpcChannels = [ MEET_CHANEL, MEET_DATA, 'renderer-ready', 'protocol-data-msg'];

window.jitsiNodeAPI = {
    jitsiMeetElectronUtils,
    ipc: {
        on: (channel, listener) => {
            if (!whitelistedIpcChannels.includes(channel)) {
                return;
            }

            return ipcRenderer.on(channel, listener);
        },
        send: (channel, listener) => {
            if (!whitelistedIpcChannels.includes(channel)) {
                return;
            }

            return ipcRenderer.send(channel, listener);
        },
        removeListener: (channel, listener) => {
            if (!whitelistedIpcChannels.includes(channel)) {
                return;
            }

            return ipcRenderer.removeListener(channel, listener);
        },
        console: (channel, listener) => {
            if (!whitelistedIpcChannels.includes(channel)) {
                return;
            }

            return ipcRenderer.send(channel, listener);
        }
    }
};
