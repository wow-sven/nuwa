const PING_COMMAND = {
	name: "ping",
	description: "Ping pong! I'll respond with pong.",
} as const;

const FAUCET_COMMAND = {
	name: "faucet",
	description: "Get testnet balance on Nuwa AI",
} as const;

export const commands = {
	ping: PING_COMMAND,
	faucet: FAUCET_COMMAND,
} as const;
