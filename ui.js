const IntervalManager = function() {
	this.ids = new Set();
};

IntervalManager.prototype.setInterval = function(func, delay) {
	const intervalId = setInterval(func, delay);
	this.ids.add(intervalId);
	return intervalId;
};

IntervalManager.prototype.clearInterval = function(intervalId) {
	clearInterval(intervalId);
	this.ids.delete(intervalId);
};

IntervalManager.prototype.setLimitedInterval = function(func, delay, duration) {
	const startTime = Date.now();
	const intervalId = this.setInterval(() => {
		//This should come before func() so that the interval stops even if func() errors out
		if (Date.now() - startTime >= duration) {
			this.clearInterval(intervalId);
		}
		func();
	}, delay);
	return intervalId;
};

IntervalManager.prototype.clearAll = function() {
	for(const id of this.ids) {
		this.clearInterval(id);
	}
};



const jsConfetti = new JSConfetti();
const intervalManager = new IntervalManager();

const chatDisplay = document.getElementById("chatDisplay");
const sendButton = document.getElementById("sendButton");
const resultSpan = document.getElementById("resultSpan");
const inputTextarea = document.getElementById("inputTextarea");
const keyInput = document.getElementById("keyInput");

const convertHistory = function(messages) {
	return messages.filter(x => convertHistory.roleMap.has(x.sender)).map(x => ({
		role: convertHistory.roleMap.get(x.sender),
		message: x.text
	}));
};
convertHistory.roleMap = new Map([
	["user", "USER"],
	["assistant", "CHATBOT"],
	["system", "SYSTEM"]
]);

const extractCode = function(message) {
	const result = [];
	//TODO robustness
	for(const match of message.matchAll(/```[\S\s]*?\n([\S\s]*?)\n```/g)) {
		result.push(match[1]);
	}
	return result;
};

const readKey = async function() {
	const text = await keyInput.files[0].text();
	return text.trim();
};

const send = async function() {
	const history = convertHistory(chatDisplay.getMessages());
	const userMessage = inputTextarea.value;
	chatDisplay.addMessage(userMessage, "user");
	inputTextarea.value = "";
	const [ok, botMessage] = await requestChat(userMessage, history, await readKey());
	if(ok) {
		chatDisplay.addMessage(botMessage, "assistant");
		window.scrollTo(0, document.body.scrollHeight);

		{
			const setInterval = intervalManager.setInterval.bind(intervalManager);
			const setLimitedInterval = intervalManager.setLimitedInterval.bind(intervalManager);
			const clearAll = intervalManager.clearAll.bind(intervalManager);
			for(const codeBlock of extractCode(botMessage)) {
				//TODO secure
				//TODO handle errors
				eval(codeBlock);
			}
		}
	}
	else {
		chatDisplay.addMessage(botMessage, "undefined");
	}
};
