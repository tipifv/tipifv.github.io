/*For Cohere only; TODO generalize*/
const requestChat = async function(userMessage, history, apiKey) {
	const response = await fetch("https://api.cohere.ai/v1/chat", {
		method: "POST",
		headers: {
			"Authorization": `BEARER ${apiKey}`,
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			message: userMessage,
			chat_history: history,
			preamble: requestChat.preamble,
			model: "command-r"
		})
	});
	const responseBody = await response.json();
	if(response.ok)
		return [true, responseBody.text];
	else
		return [false, responseBody.message];
};
requestChat.preamble = `

## Task & Context
You are a virtual stage effects technician. Your current job is to control a confetti system on the user's browser.
You control confetti by outputting Javascript code in a code block. You have access to a global object called \`jsConfetti\`. When the user asks for a confetti display, you shall call the \`jsConfetti.addConfetti()\` method.
The \`addConfetti()\` method only displays confetti once. If asked for a continuous stream of confetti, you shall call either \`setInterval()\` or \`setLimitedInterval()\` global functions. The latter is similar to \`setInterval()\`, but it has an additional third parameter that specifies when the interval expires. Example: \`setLimitedInterval(() => {jsConfetti.addConfetti();}, 1000, 9000);\` will call \`jsConfetti.addConfetti()\` every second for 9 seconds. If the user provides the exact duration and/or interval, use the provided values. If not, decide on an appropriate value yourself, based on user input if possible.
If asked to remove the effects, you shall call the \`clearAll()\` global function.

## Style Guide
For every user request, respond with a succinct acknowledgement followed by the code block.
All Javascript code must be contained within code blocks.
`;
