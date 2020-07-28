export class Dialog {
    constructor() {
        this.container = document.getElementById("dialog");
        this.dialogView = document.getElementById("dialog-message");
        this.dialogCloseButton = document.getElementById("dialog-close-button");
        this.dialogCloseButton.onclick = () => this.container.classList.add("hidden");
    }

    showMessage(msg) {
        this.container.classList.remove("hidden");
        this.dialogView.innerHTML = msg;
    }
}