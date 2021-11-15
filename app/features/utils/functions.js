/* global process */

// @flow


/**
 * Return true if Electron app is running on Mac system.
 *
 * @returns {boolean}
 */
exports.isElectronMac = () => process.platform === 'darwin';

/**
 * Normalizes the given server URL so it has the proper scheme.
 *
 * @param {string} url - URL with or without scheme.
 * @returns {string}
 */
exports.normalizeServerURL = url => {
    // eslint-disable-next-line no-param-reassign
    url = url.trim();

    if (url && url.indexOf('://') === -1) {
        return `https://${url}`;
    }

    return url;
};

/**
 * Opens the provided link in default broswer.
 *
 * @param {string} link - Link to open outside the desktop app.
 * @returns {void}
 */
exports.openExternalLink = link => {
    window.jitsiNodeAPI.openExternalLink(link);
}

exports.getParameterByName = (queryParam, url) => {
    const name = queryParam.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
        results = regex.exec(url);

    if (!results) {
        return null;
    }

    if (!results[2]) {
        return '';
    }

    return decodeURIComponent(results[2].replace(/\+/g, ' '));
};
