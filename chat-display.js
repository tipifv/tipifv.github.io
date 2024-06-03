class ChatDisplay extends HTMLElement {
	constructor() {
		super();
		//TODO: Don't store messages here?
		this.messages = [];
		this.converter = new showdown.Converter();
		this.hideCode = true;
		this.renderMarkdown = true;
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
		//TODO: dynamic behaviors
		let htmlText = text;
		if(this.hideCode) htmlText = ChatDisplay.removeCode(htmlText);
		if(this.renderMarkdown) htmlText = this.converter.makeHtml(htmlText);
		const messageDiv = document.createElement('div');
		messageDiv.classList.add('message', sender);
		messageDiv.innerHTML = htmlText;
		this.container.appendChild(messageDiv);

		this.messages.push({ text, sender });
	}

	refresh() {
		const temp = this.messages;
		this.clear();
		for(let i = 0;i < temp.length;i++) {
			this.addMessage(temp[i].text, temp[i].sender);
		}
	}

	clear() {
		this.messages = [];
		this.container.innerHTML = '';
	}

	getMessages() {
		return this.messages;
	}

	static removeCode(text) {
		return text.replace(/```[\S\s]*?\n([\S\s]*?)\n```/g, '');
	}
}

window.customElements.define('chat-display', ChatDisplay);
