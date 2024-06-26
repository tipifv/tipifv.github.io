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
const fireworks = new Fireworks.Fireworks(document.getElementById("fireworksContainer"));
var vanta = null;
var vantaType = null; //TODO: move somewhere else
const intervalManager = new IntervalManager();
var requestChat = Cohere.requestChat;

const chatDisplay = document.getElementById("chatDisplay");
const sendButton = document.getElementById("sendButton");
const resultSpan = document.getElementById("resultSpan");
const inputTextarea = document.getElementById("inputTextarea");
const keyInput = document.getElementById("keyInput");
const hideCodeCheckbox = document.getElementById("hideCodeCheckbox");
const hideUiCheckbox = document.getElementById("hideUiCheckbox");

const extractCode = function(message) {
	const result = [];
	//TODO robustness
	for(const match of message.matchAll(/```[\S\s]*?\n([\S\s]*?)\n```/g)) {
		result.push(match[1]);
	}
	return result;
};

const readKey = async function() {
	if(keyInput.files.length > 0) {
		const text = await keyInput.files[0].text();
		return text.trim();
	}
	else return '';
};

const refreshChat = function() {
	chatDisplay.hideCode = hideCodeCheckbox.checked;
	chatDisplay.refresh();
};

const keyListener = function(e) {
	//if(e.key === " ") {
	hideUiCheckbox.checked = false;
	hideUi();
	//}
};

const hideUi = function() {
	const toHide = ["mainDiv", "sideDiv"];
	for(const elem of toHide) {
		if(hideUiCheckbox.checked)
			document.getElementById(elem).classList.add("invisible");
		else
			document.getElementById(elem).classList.remove("invisible");
	}
	if(hideUiCheckbox.checked)
		document.addEventListener("keyup", keyListener);
	else
		document.removeEventListener("keyup", keyListener);
};

const send = async function() {
	chatDisplay.addMessage(inputTextarea.value, "user");
	inputTextarea.value = "";
	const history = chatDisplay.getMessages();
	const [ok, botMessage] = await requestChat(history, await readKey());
	if(ok) {
		chatDisplay.addMessage(botMessage, "assistant");
		window.scrollTo(0, document.body.scrollHeight);
		executeEffects(extractCode(botMessage));
	}
	else {
		chatDisplay.addMessage(botMessage, "undefined");
	}
};

const executeEffects = function(codeStrings) {
	const addConfetti = function(params) {
		//TODO generalize
		if(params.emojiSize != undefined)
			params.emojiSize = Math.max(10, Math.min(params.emojiSize, 160));
		if(params.confettiNumber != undefined)
			params.confettiNumber = Math.max(5, Math.min(params.confettiNumber, 120));
		jsConfetti.addConfetti(params);
	};
	const launchFireworks = function(params) {
		let count = params.count;
		if(count == undefined) count = 6;
		fireworks.launch(count, params);
	};
	const launchVanta = function(params) {
		const effect = params.effect;
		delete params.effect;
		params.el = "#vantaContainer";
		params.mouseControls = true;
		params.touchControls = true;
		params.scale = 1.5;
		params.scaleMobile = 1.5;
		if(effect === "BIRDS") {
			params.separation = 80;
			if(params.quantity != undefined)
				params.quantity = Math.max(1, Math.min(params.quantity, 5));
		}
		else if(effect === "DOTS") {
			params.showLines = false;
			if(params.size != undefined)
				params.size = Math.max(4.0, Math.min(params.size, 7.0));
		}
		if(vanta != null) {
			if(vantaType === effect)
				vanta.setOptions(params);
			else {
				vanta.destroy();
				vanta = VANTA[effect](params);
			}
		}
		else vanta = VANTA[effect](params);
	};
	const setInterval = intervalManager.setInterval.bind(intervalManager);
	const setLimitedInterval = intervalManager.setLimitedInterval.bind(intervalManager);
	const clearAll = function() {
		intervalManager.clearAll();
		if(vanta != null) {
			vanta.destroy();
			vanta = null;
		}
	};
	for(const code of codeStrings) {
		//TODO secure
		//TODO handle errors
		eval(code);
	}
};



refreshChat();
hideUiCheckbox.checked = false;
