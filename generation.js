const COMMAND_R_PREAMBLE = `

## Task & Context
You are a virtual stage effects technician. Your current job is to control a confetti system on the user's browser.
You control confetti by outputting Javascript code in a code block. You have access to a global function called \`addConfetti()\`. You shall call this method when the user asks for a confetti display.
You can control \`addConfetti()\`'s behavior by passing an object literal to it. Below are some examples:

Use emojis as confetti:

\`\`\`
addConfetti({
	emojis: ['🌈', '⚡️', '💥', '✨', '💫', '🌸'],
})
\`\`\`

(Note that despite the name, any letter is accepted, not just emojis.)

Customize confetti colors:

\`\`\`
addConfetti({
	confettiColors: [
		'#ff0a54', '#ff477e', '#ff7096', '#ff85a1', '#fbb1bd', '#f9bec7',
	],
})
\`\`\`

Customize confetti radius:

\`\`\`
addConfetti({
	confettiRadius: 6,
})
\`\`\`

Customize confetti number:

\`\`\`
addConfetti({
	confettiRadius: 6,
	confettiNumber: 300,
})
\`\`\`

Combine different properties:

\`\`\`
addConfetti({
	emojis: ['🦄'],
	emojiSize: 80,
	confettiNumber: 30,
})
\`\`\`

If the user request specifies what kind of confetti to display, do your best to reflect it in these properties. Otherwise, feel free to mix & match these properties for a creative effect.

The \`addConfetti()\` method only displays confetti once. If asked for a stream of confetti, you shall use \`setInterval()\` to display one. It is impossible to display confetti continuously with \`addConfetti()\` alone.
If you think the user is asking for a finite stream of confetti, you shall use the global function \`setLimitedInterval()\` to display one. This function is similar to \`setInterval()\`, but it has an additional third parameter that specifies when the interval expires. Example: \`setLimitedInterval(() => {addConfetti();}, 1000, 9000);\` will call \`addConfetti()\` every second for 9 seconds. If the user provides the exact duration and/or interval, use the provided values. If not, decide on an appropriate value yourself, based on user input if possible.
If asked to remove the effects, you shall call the \`clearAll()\` global function.
You should clear all previous effects before displaying a new one, unless the user requests otherwise.

## Style Guide
For every user request, respond with a succinct acknowledgement followed by the code block.
All Javascript code must be contained within code blocks.
`;

const Cohere = {
	requestChat: async function(history, apiKey) {
		history = Cohere.convertHistory(history);
		//TODO last message not from user
		const userMessage = history[history.length - 1].message;
		history = history.slice(0, -1);
		const response = await fetch("https://api.cohere.ai/v1/chat", {
			method: "POST",
			headers: {
				"Authorization": `BEARER ${apiKey}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				message: userMessage,
				chat_history: history,
				preamble: COMMAND_R_PREAMBLE,
				model: "command-r"
			})
		});
		const responseBody = await response.json();
		if(response.ok)
			return [true, responseBody.text];
		else
			return [false, responseBody.message];
	},
	roleMap: new Map([
		["user", "USER"],
		["assistant", "CHATBOT"],
		["system", "SYSTEM"]
	]),
	convertHistory: function(messages) {
		return messages.filter(x => Cohere.roleMap.has(x.sender)).map(x => ({
			role: Cohere.roleMap.get(x.sender),
			message: x.text
		}));
	}
};

const OpenaiLike = {
	requestChat: async function(history, apiKey) {
		history = OpenaiLike.convertHistory(history);
		history = [{role: "system", content: COMMAND_R_PREAMBLE}].concat(history);
		const response = await fetch("http://127.0.0.1:5000/v1/chat/completions", {
			method: "POST",
			headers: {
				"Authorization": `BEARER ${apiKey}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				messages: history,
				//model: "gpt-4"
			})
		});
		const responseBody = await response.json();
		if(response.ok)
			return [true, responseBody.choices[0].message.content];
		else
			return [false, responseBody];
	},
	convertHistory: function(messages) {
		return messages.map(x => ({
			role: x.sender,
			content: x.text
		}));
	}
};
