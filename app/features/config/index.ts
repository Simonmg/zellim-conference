
exports.defaultServerURL = 'https://desktop.zellim.com/v1';
exports.appProtocolPrefix = 'zellim-conference';

exports.SERVER = {
    LOCAL: "http://localhost:3000/module/",
    REMOTE: "https://app.zellim.com/module/",
  };
  
exports.VAULT_MODULE = {
    CHECK_LOGIN: "vault/electron/checkLogin",
    VAULT_INSTALL: "vault/electron/install",
    VAULT_UNINSTALL: "vault/electron/uninstall",
    VAULT_LOGOUT: "vault/electron/logout",
};

exports.CONFERENCE_MODULE = {
    GET_TOKEN: "chat/conference/rooms/join/"
}

exports.ELECTRON_CHANNELS = {
    MEET_CHANEL: "meet_chanel",
    MEET_DATA: "meet_data"
}