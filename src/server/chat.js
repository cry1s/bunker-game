const Constants = require('../shared/constants');

class Chat {
    constructor( sockets) {
        this.sockets = sockets;
    }

    sendMessageForAll(msg) {
        Object.keys(this.sockets).forEach(socket => {
            this.sockets[socket].emit(Constants.MSG_TYPES.CHAT_UPDATE, msg)
        })
    }
}

module.exports = Chat;