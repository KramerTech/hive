import Toastify from "toastify-js";
import "toastify-js/src/toastify.css"

export class Toasts {

	private static toast: any;
	private static chatEnabled = false;
	private static chatToggle: any;

	static show(text: string, onClick?: any) {
		if (this.toast) {
			const old = this.toast;
			setTimeout(() => {
				old.hideToast();
			}, 300);
		};
		this.toast = Toastify({
			text: text,
			duration: -1,
			position: "center",
			gravity: "bottom",
			onClick: onClick,
			backgroundColor: "#5C60C9",
		});
		this.toast.showToast();
	}

	static chat(text: string, me: boolean) {
		if (this.chatEnabled) {
			const chat = Toastify({
				text: text,
				duration: 15000,
				offset: {y: 50},
				onClick: () => chat.hideToast(),
				backgroundColor: me ? "#356D38" : "#BC4B00",
			});
			chat.showToast();
		}
	}

	static chatFlip() {
		this.chatEnabled = !this.chatEnabled;
		(document.getElementById("chat") as HTMLTextAreaElement).style.display = this.chatEnabled ? "block" : "none";
		if (this.chatToggle) { this.chatToggle.hideToast(); }
		this.chatToggle = Toastify({
			text: (this.chatEnabled ? "Disable" : "Enable") + " Chat",
			duration: -1,
			onClick: () => this.chatFlip(),
			position: "left",
			backgroundColor: "#57007F",
		});
		this.chatToggle.showToast();
	}

}

Toasts.chatFlip();
