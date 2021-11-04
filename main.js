const {
    BrowserWindow,
    app,
    ipcMain,
    ipcRenderer
} = require('electron');
const debug = require('electron-debug');
const isDev = require('electron-is-dev');
const windowStateKeeper = require('electron-window-state');
const {
    initPopupsConfigurationMain,
    getPopupTarget,
    setupAlwaysOnTopMain,
    setupPowerMonitorMain,
    setupScreenSharingMain
} = require('jitsi-meet-electron-utils');
const path = require('path');
const URL = require('url');
const config = require('./app/features/config');
const { openExternalLink } = require('./app/features/utils/openExternalLink');
const { existsSync } = require('fs');

const { getParameterByName, normalizeServerURL } = require('./app/features/utils/functions');

const showDevTools = Boolean(process.env.SHOW_DEV_TOOLS) || (process.argv.indexOf('--show-dev-tools') > -1);

if (typeof snapshotResult !== 'undefined') {
    console.log('snapshotResult available!', snapshotResult)
}

// We need this because of https://github.com/electron/electron/issues/18214
app.commandLine.appendSwitch('disable-site-isolation-trials');

// This allows BrowserWindow.setContentProtection(true) to work on macOS.
// https://github.com/electron/electron/issues/19880
app.commandLine.appendSwitch('disable-features', 'IOSurfaceCapturer');

// Enable Opus RED field trial.
app.commandLine.appendSwitch('force-fieldtrials', 'WebRTC-Audio-Red-For-Opus/Enabled/');

// Enable optional PipeWire support.
if (!app.commandLine.hasSwitch('enable-features')) {
    app.commandLine.appendSwitch('enable-features', 'WebRTCPipeWireCapturer');
}

// Needed until robot.js is fixed: https://github.com/octalmage/robotjs/issues/580
app.allowRendererProcessReuse = false;


// Enable DevTools also on release builds to help troubleshoot issues. Don't
// show them automatically though.
debug({
    isEnabled: true,
    showDevTools
});

/**
 * When in development mode:
 * - Enable automatic reloads
 */
if (isDev) {
    require('electron-reload')(path.join(__dirname, 'build'));
}

/**
 * The window object that will load the iframe with Jitsi Meet.
 * IMPORTANT: Must be defined as global in order to not be garbage collected
 * acidentally.
 */
let mainWindow = null;

let webrtcInternalsWindow = null;

/**
 * Add protocol data
 */
const appProtocolSurplus = `${config.appProtocolPrefix}://`;
let rendererReady = false;
let protocolDataForFrontApp = false;


const handleMeetData = async data => {
    if (data.close) app.quit();
};


const meetURL = process.argv.filter(arg => arg.includes('zellim.us'));
console.log(meetURL);
/**
 * Opens new window with index.html(Jitsi Meet is loaded in iframe there).
 */
function createConferenceMeetWindow() {
    // Application menu.
    // setApplicationMenu();

    // Check for Updates.
    // Load the previous window state with fallback to defaults.
    const windowState = windowStateKeeper({
        defaultWidth: 800,
        defaultHeight: 600
    });

    // Path to root directory.
    let basePath = isDev ? __dirname : app.getAppPath();

    // runtime detection on mac if this is a universal build with app-arm64.asar'
    // as prepared in https://github.com/electron/universal/blob/master/src/index.ts
    // if universal build, load the arch-specific real asar as the app does not load otherwise
    if (process.platform === 'darwin' && existsSync(path.join(app.getAppPath(), '..', 'app-arm64.asar'))) {
        if (process.arch === 'arm64') {
            basePath = app.getAppPath().replace('app.asar', 'app-arm64.asar');
        } else if (process.arch === 'x64') {
            basePath = app.getAppPath().replace('app.asar', 'app-x64.asar');
        }
    }

    // URL for index.html which will be our entry point.
    const indexURL = URL.format({
        pathname: path.resolve(basePath, './build/index.html'),
        protocol: 'file:',
        slashes: true
    });

    // Options used when creating the main Jitsi Meet window.
    // Use a preload script in order to provide node specific functionality
    // to a isolated BrowserWindow in accordance with electron security
    // guideline.
    const options = {
        x: windowState.x,
        y: windowState.y,
        width: windowState.width,
        height: windowState.height,
        icon: path.resolve(basePath, './resources/icon.png'),
        minWidth: 800,
        minHeight: 600,
        show: true,
        frame: true,
        webPreferences: {
            enableBlinkFeatures: 'RTCInsertableStreams,WebAssemblySimd,WebAssemblyCSP',
            enableRemoteModule: true,
            contextIsolation: false,
            nativeWindowOpen: true,
            nodeIntegration: false,
            preload: path.resolve(basePath, './app/renderer/preload.js')
        }
    };

    mainWindow = new BrowserWindow(options);
    windowState.manage(mainWindow);
    mainWindow.loadURL(indexURL);
    mainWindow.removeMenu();
    mainWindow.openDevTools();
    mainWindow.webContents.openDevTools();

    initPopupsConfigurationMain(mainWindow);
    setupAlwaysOnTopMain(mainWindow);
    setupPowerMonitorMain(mainWindow);
    setupScreenSharingMain(mainWindow, 'zellim-conference');

    mainWindow.webContents.on('new-window', (event, url, frameName) => {
        const target = getPopupTarget(url, frameName);

        if (!target || target === 'browser') {
            event.preventDefault();
            openExternalLink(url);
        }
    });
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });
    /**
     * When someone tries to enter something like jitsi-meet://test
     *  while app is closed
     * it will trigger this event below
     */
    handleProtocolCall(process.argv.pop());
}

/**
 * Opens new window with WebRTC internals.
 */
function createWebRTCInternalsWindow() {
    const options = {
        minWidth: 800,
        minHeight: 600,
        show: true
    };

    webrtcInternalsWindow = new BrowserWindow(options);
    webrtcInternalsWindow.loadURL('chrome://webrtc-internals');
}

/**
 * Handler for application protocol links to initiate a conference.
 */
function handleProtocolCall(fullProtocolCall) {
    // don't touch when something is bad
    if (
        !fullProtocolCall
        || fullProtocolCall.trim() === ''
        || fullProtocolCall.indexOf(appProtocolSurplus) !== 0
    ) {
        return;
    }

    const inputURL = fullProtocolCall.replace(appProtocolSurplus, '');
    console.log(normalizeServerURL(inputURL));
    room = getParameterByName('room', normalizeServerURL(inputURL));
    if (app.isReady() && mainWindow === null) {
        createConferenceMeetWindow();
    }

    protocolDataForFrontApp = inputURL;

    if (rendererReady) {
        mainWindow
            .webContents
            .send('protocol-data-msg', inputURL);
    }
}

/**
 * Force Single Instance Application.
 * Handle this on darwin via LSMultipleInstancesProhibited in Info.plist as below does not work on MAS
 */
const gotInstanceLock = process.platform === 'darwin' ? true : app.requestSingleInstanceLock();

if (!gotInstanceLock) {
    app.quit();
    process.exit(0);
}

/**
 * Run the application.
 */

app.on('activate', () => {
    if (mainWindow === null) {
        createConferenceMeetWindow();
    }
});

app.on('certificate-error',
    // eslint-disable-next-line max-params
    (event, webContents, url, error, certificate, callback) => {
        if (isDev) {
            event.preventDefault();
            callback(true);
        } else {
            callback(false);
        }
    }
);

app.on('ready', () => {
    console.log('app is running');
    if (checkIfCallViaCLI(process.argv)) {
        createConferenceMeetWindow();
    }
});

if (isDev) {
    app.on('ready', createWebRTCInternalsWindow);
}

app.on('second-instance', (event, commandLine) => {
    console.log(commandLine);
    
    /**
     * If someone creates second instance of the application, set focus on
     * existing window.
     */
    if (mainWindow) {
        mainWindow.isMinimized() && mainWindow.restore();
        mainWindow.focus();

        /**
         * This is for windows [win32]
         * so when someone tries to enter something like jitsi-meet://test
         * while app is opened it will trigger protocol handler.
         */
        handleProtocolCall(commandLine.pop());
    }
});

app.on('window-all-closed', () => {
    app.quit();
});

// remove so we can register each time as we run the app.
app.removeAsDefaultProtocolClient(config.appProtocolPrefix);

// If we are running a non-packaged version of the app && on windows
if (isDev && process.platform === 'win32') {
    // Set the path of electron.exe and your app.
    // These two additional parameters are only available on windows.
    app.setAsDefaultProtocolClient(
        config.appProtocolPrefix,
        process.execPath,
        [ path.resolve(process.argv[1]) ]
    );
} else {
    app.setAsDefaultProtocolClient(config.appProtocolPrefix);
}

/**
 * This is for mac [darwin]
 * so when someone tries to enter something like jitsi-meet://test
 * it will trigger this event below
 */
app.on('open-url', (event, data) => {
    event.preventDefault();
    handleProtocolCall(data);
});

/**
 * This is to notify main.js [this] that front app is ready to receive messages.
 */
ipcMain.on('renderer-ready', (data, event) => {
    rendererReady = true;
    console.log(`render ready: ${rendererReady} ${data} ${event}`);
    if (protocolDataForFrontApp) {
        mainWindow
            .webContents
            .send('protocol-data-msg', {protocolDataForFrontApp});
    }

    mainWindow.webContents.send('protocol-data-msg', {meetURL});
});

ipcMain.on('electron-store-exists', event => {
    event.returnValue = existsSync(path.join(app.getPath('userData'), 'config.json'));
});

ipcMain.on('meet_data', async (event, data) => {
    handleMeetData(data);
});


const checkIfCallViaCLI = (args) => args && args.length > 1;