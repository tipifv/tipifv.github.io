class ChatDisplay extends HTMLElement {
	constructor() {
		super();
		this.messages = [];
		this.converter = new showdown.Converter();
		this.attachShadow({ mode: 'open' });
		this.shadowRoot.innerHTML = `
			<style>
				.message {
					max-width: 80%;
					margin: 5px;
					padding: 8px 12px;
					border-radius: 15px;
					color: #fff;
					text-wrap: wrap;
				}
				.user {
					background-color: #007bff;
					align-self: flex-end;
					margin-left: 20%;
				}
				.assistant {
					background-color: #28a745;
					align-self: flex-start;
					margin-right: 20%;
				}
				.system {
					background-color: #6c757d;
					align-self: center;
					text-align: center;
					width: 100%;
				}
				.undefined {
					background-color: #ff0000;
					align-self: flex-start;
					margin-right: 20%;
				}
			</style>
			<div id="container"></div>
		`;
		this.container = this.shadowRoot.querySelector('#container');
	}

	addMessage(text, sender) {
		const htmlText = this.converter.makeHtml(text);
		const messageDiv = document.createElement('div');
		messageDiv.classList.add('message', sender);
		messageDiv.innerHTML = htmlText;
		this.container.appendChild(messageDiv);

		this.messages.push({ text, sender });
		this.scrollTop = this.scrollHeight;
	}

	clear() {
		this.messages = [];
		this.container.innerHTML = '';
	}

	getMessages() {
		return this.messages;
	}
}

window.customElements.define('chat-display', ChatDisplay);
