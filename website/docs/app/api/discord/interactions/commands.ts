const PING_COMMAND = {
	name: "ping",
	description: "Ping pong! I'll respond with pong.",
} as const;

const FAUCET_COMMAND = {
	name: "faucet",
	description: "Get testnet RGAS on Nuwa AI",
	options: [
		{
			name: "did",
			description: "Your DID (did:rooch:address)",
			type: 3, // STRING type
			required: true,
		},
	],
} as const;

export const commands = {
	ping: PING_COMMAND,
	faucet: FAUCET_COMMAND,
} as const;
