import { endJustGameState } from "./gamestate";
import Constants from "../shared/constants";

export class Dialog {
    constructor() {
        this.container = document.getElementById("dialog");
        this.dialogView = document.getElementById("dialog-message");
        this.timerView = document.getElementById("timer");
        this.nodeTimer = null;
        this.dialogCloseButton = document.getElementById("dialog-close-button");
        this.dialogEndJustButton = document.getElementById("dialog-end-just-button");
        this.dialogEndJustButton.onclick = () => this.endJustification();
        this.dialogCloseButton.onclick = () => this.close();
    }

    showMessage(msg) {
        this.dialogEndJustButton.classList.add("hidden");
        this.timerView.classList.add("hidden");
        this.container.classList.remove("hidden");
        this.dialogView.innerHTML = msg;
    }

    startJustificationTimer(me) {
        me = Boolean(me);
        this.timerView.classList.remove("hidden");
        this.startTimer()
        if (me) {
            this.dialogEndJustButton.classList.remove("hidden");
        }
    }

    endJustification() {
        endJustGameState();
        this.close();
    }

    startTimer() {
        let secs = Constants.JUSTIFICATION_TIME_SECS;
        this.nodeTimer = setInterval(() => {
            this.timerView.innerHTML = --secs
        }, 1000);
        setTimeout(() => {
            this.onJustEnded();
        }, Constants.JUSTIFICATION_TIME_SECS * 1000)
    }

    onJustEnded() {
        clearInterval(this.nodeTimer);
        this.timerView.classList.add("hidden");
        this.dialogEndJustButton.classList.add("hidden");
        this.close();
    }

    close() {
        this.container.classList.add("hidden");
    }
}