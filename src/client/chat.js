import {
    sendMsg
} from "./networking";

export class Chat {
    constructor(key, username) {
        this.key = key;
        this.username = username;
        this.container = document.getElementById("game-chat");
        console.log(this.container);
        this.textView = document.getElementById("messages");
        this.messageView = document.getElementById("message");
        this.sendButton = document.getElementById("send-button");
        this.sendButton.onclick = () => this.sendMessage();
        this.onUpdate(`Привет, ${username}! Подключен к бункеру №${key}`);
    }

    sendMessage() {
        let msg = this.messageView.value;
        if (msg) {
            sendMsg(this.key, this.username + ": " + msg);
        }
        this.messageView.value = "";
    }

    onUpdate(text) {
        this.textView.innerHTML += text + "\n";
    }

    clear() {
        this.textView.innerHTML = '';
    }
}